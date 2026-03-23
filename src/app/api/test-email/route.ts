import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

// GET /api/test-email?to=youremail@example.com
// Only works in development
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Only available in development' }, { status: 403 })
  }

  const to = request.nextUrl.searchParams.get('to')
  if (!to) {
    return NextResponse.json({ error: 'Missing ?to= query param' }, { status: 400 })
  }

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return NextResponse.json({
      error: 'SMTP not configured',
      missing: { SMTP_HOST: !SMTP_HOST, SMTP_USER: !SMTP_USER, SMTP_PASS: !SMTP_PASS },
    }, { status: 500 })
  }

  const port = parseInt(SMTP_PORT || '465')

  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    })

    // Verify SMTP connection first
    await transporter.verify()

    // Send test email
    const info = await transporter.sendMail({
      from: SMTP_FROM || SMTP_USER,
      to,
      subject: '✅ Wings Academy — SMTP Test Email',
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:500px;margin:40px auto;padding:32px;border:1px solid #e2e8f0;border-radius:16px;">
          <h2 style="color:#0f172a;margin:0 0 16px;">SMTP is working!</h2>
          <p style="color:#64748b;">This is a test email from your Wings Academy platform.</p>
          <hr style="border:none;border-top:1px solid #f1f5f9;margin:24px 0;" />
          <p style="color:#94a3b8;font-size:12px;">
            Host: <strong>${SMTP_HOST}:${port}</strong><br/>
            From: <strong>${SMTP_FROM || SMTP_USER}</strong><br/>
            Sent at: ${new Date().toISOString()}
          </p>
        </div>
      `,
    })

    return NextResponse.json({
      success: true,
      message: `Test email sent to ${to}`,
      messageId: info.messageId,
    })
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message,
      code: err.code,
    }, { status: 500 })
  }
}
