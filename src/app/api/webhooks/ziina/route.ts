import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { verifyWebhookSignature, parsePaymentMessage, ZIINA_WEBHOOK_IPS } from '@/utils/ziina'
import nodemailer from 'nodemailer'

function createMailTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: (process.env.SMTP_PORT || '465') === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

function getServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: NextRequest) {
  // 1. IP whitelist check
  const forwarded = request.headers.get('x-forwarded-for')
  const clientIp = forwarded ? forwarded.split(',')[0].trim() : null

  // In development, skip IP check
  const isDev = process.env.NODE_ENV === 'development'
  if (!isDev && clientIp && !ZIINA_WEBHOOK_IPS.includes(clientIp)) {
    console.warn(`Webhook rejected: unauthorized IP ${clientIp}`)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // 2. Read raw body for HMAC verification
  const rawBody = await request.text()
  const signature = request.headers.get('x-hmac-signature')

  if (signature && process.env.ZIINA_WEBHOOK_SECRET) {
    if (!verifyWebhookSignature(rawBody, signature)) {
      console.warn('Webhook rejected: invalid HMAC signature')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  // 3. Parse payload
  let payload: any
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { event, data } = payload

  if (event !== 'payment_intent.status.updated') {
    return NextResponse.json({ received: true })
  }

  const paymentIntentId = data?.id
  const status = data?.status
  const message = data?.message || ''

  // Only process completed payments
  if (status !== 'completed') {
    return NextResponse.json({ received: true })
  }

  try {
    const supabase = getServiceClient()

    // 4. Find the pending payment by Ziina payment intent ID
    const { data: payment } = await supabase
      .from('payments')
      .select('id, user_id, module_id, status')
      .eq('transaction_id', paymentIntentId)
      .maybeSingle()

    if (!payment) {
      console.warn(`Webhook: no payment found for intent ${paymentIntentId}`)
      return NextResponse.json({ received: true })
    }

    // Idempotency: already processed
    if (payment.status === 'completed') {
      return NextResponse.json({ received: true })
    }

    // 5. Update payment status to completed
    const { error: updateErr } = await supabase
      .from('payments')
      .update({ status: 'completed' })
      .eq('id', payment.id)

    if (updateErr) {
      console.error('Webhook: failed to update payment:', updateErr)
      return NextResponse.json({ error: 'DB error' }, { status: 500 })
    }

    // 6. Get module info from DB
    const moduleId = payment.module_id
    const userId = payment.user_id

    let moduleName = 'your module'
    if (moduleId) {
      const { data: mod } = await supabase
        .from('modules')
        .select('name')
        .eq('id', moduleId)
        .maybeSingle()
      if (mod?.name) moduleName = mod.name
    }

    // 7. Notify the student (in-app)
    await supabase.from('notifications').insert({
      user_id: userId,
      type: 'payment_success',
      title: 'Module Unlocked!',
      message: `Your payment has been confirmed. All tests in "${moduleName}" are now available with unlimited attempts.`,
    })

    // 8. Send email to student
    try {
      const { data: student } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', userId)
        .maybeSingle()

      const { data: paymentInfo } = await supabase
        .from('payments')
        .select('amount')
        .eq('id', payment.id)
        .maybeSingle()

      if (process.env.SMTP_HOST && student?.email) {
        const studentName = student.full_name || 'Student'
        const amount = paymentInfo?.amount || 49
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://wings-academy-mock-test-project.vercel.app'

        const emailHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:system-ui,-apple-system,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 4px 32px rgba(0,0,0,0.06);">
    <div style="background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%);padding:40px;text-align:center;">
      <div style="width:64px;height:64px;background:rgba(255,255,255,0.15);border-radius:16px;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:32px;">✅</span>
      </div>
      <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:900;">Module Unlocked!</h1>
      <p style="color:#94a3b8;margin:8px 0 0;font-size:14px;font-weight:600;">Your payment has been confirmed</p>
    </div>
    <div style="padding:40px;">
      <p style="color:#0f172a;font-size:16px;font-weight:700;margin:0 0 8px;">Hi ${studentName},</p>
      <p style="color:#64748b;font-size:14px;line-height:1.7;margin:0 0 32px;">
        Great news! Your payment of <strong style="color:#0f172a;">AED ${amount}</strong> has been successfully processed.
        All tests in <strong style="color:#0f172a;">"${moduleName}"</strong> are now unlocked with <strong style="color:#16a34a;">unlimited attempts</strong>.
      </p>
      <div style="background:#f0fdf4;border-radius:16px;padding:24px;margin-bottom:32px;border:1px solid #bbf7d0;">
        <p style="color:#15803d;font-size:12px;font-weight:900;letter-spacing:1px;text-transform:uppercase;margin:0 0 12px;">What you get</p>
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:6px 0;color:#0f172a;font-size:14px;font-weight:600;">📚 ${moduleName}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#16a34a;font-size:13px;font-weight:700;">✓ All tests unlocked</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#16a34a;font-size:13px;font-weight:700;">✓ Unlimited attempts</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#16a34a;font-size:13px;font-weight:700;">✓ Full performance analytics</td>
          </tr>
        </table>
      </div>
      <a href="${siteUrl}/dashboard/modules" style="display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;padding:16px 32px;border-radius:12px;font-weight:900;font-size:13px;letter-spacing:1px;text-transform:uppercase;">
        Start Practicing →
      </a>
    </div>
    <div style="padding:24px 40px;border-top:1px solid #f1f5f9;text-align:center;">
      <p style="color:#94a3b8;font-size:12px;margin:0;">Wings Academy · Prepare for Take Off</p>
      <p style="color:#cbd5e1;font-size:11px;margin:4px 0 0;">UAE Aviation Training Platform</p>
    </div>
  </div>
</body>
</html>`.trim()

        const transporter = createMailTransporter()
        await transporter.sendMail({
          from: process.env.SMTP_FROM || 'Wings Academy <results@wingsacademy.ae>',
          to: student.email,
          subject: `✅ Module Unlocked — ${moduleName}`,
          html: emailHtml,
        })
        console.log(`Webhook: confirmation email sent to ${student.email}`)
      }
    } catch (emailErr) {
      // Email failure should not block the webhook response
      console.error('Webhook: failed to send student email:', emailErr)
    }

    console.log(`Webhook: payment completed for user ${userId}, module ${moduleId}`)
    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Webhook processing error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
