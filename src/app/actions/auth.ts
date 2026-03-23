'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getURL } from '@/utils/url'
import nodemailer from 'nodemailer'

async function sendWelcomeEmail(name: string, email: string) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, NEXT_PUBLIC_SITE_URL } = process.env
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return

  const siteUrl = NEXT_PUBLIC_SITE_URL || 'https://wings-academy-mock-test-project.vercel.app'
  const port = parseInt(SMTP_PORT || '465')

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  })

  await transporter.sendMail({
    from: SMTP_FROM || SMTP_USER,
    to: email,
    subject: 'Welcome to Wings Academy',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Welcome to Wings Academy</title>
</head>
<body style="font-family:Arial,sans-serif;background:#f5f5f5;padding:40px;">
  <div style="max-width:600px;margin:auto;background:white;padding:30px;border-radius:8px;text-align:center;">
    <h2 style="color:#333;">Welcome to Wings Academy, ${name}!</h2>
    <p style="font-size:16px;color:#555;">
      Thank you for signing up for your mock test platform.
    </p>
    <p style="font-size:16px;color:#555;">
      Please confirm your email to activate your account and start practicing.
    </p>
    <a href="${siteUrl}/login"
       style="display:inline-block;margin-top:20px;padding:14px 28px;
       background:#1e3a8a;color:white;text-decoration:none;
       border-radius:6px;font-size:16px;font-weight:bold;">
       Go to Login
    </a>
    <p style="margin-top:30px;font-size:13px;color:#888;">
      If you didn't create this account, you can safely ignore this email.
    </p>
    <p style="margin-top:20px;font-size:13px;color:#888;">
      © Wings Academy
    </p>
  </div>
</body>
</html>`.trim(),
  })
}

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  // Check user role for redirection
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('id', data.user.id)
    .single()

  if (profile?.status === 'suspended') {
    await supabase.auth.signOut()
    return redirect(`/login?error=${encodeURIComponent('Your account has been suspended. Please contact support.')}`)
  }

  revalidatePath('/admin', 'layout')
  revalidatePath('/dashboard', 'layout')
  revalidatePath('/', 'page')
  
  if (profile?.role === 'admin') {
    return redirect('/admin')
  }
  
  return redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string

  if (!password || password.length < 8) {
    return redirect(`/signup?error=${encodeURIComponent('Password must be at least 8 characters')}`)
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name
      },
      emailRedirectTo: `${getURL()}api/auth/callback?next=/login?message=${encodeURIComponent('Email confirmed. Please log in to your account.')}`,
    }
  })

  if (error) {
    return redirect(`/signup?error=${encodeURIComponent(error.message)}`)
  }

  // Send welcome email (non-blocking — failure won't break signup)
  sendWelcomeEmail(name, email).catch(err =>
    console.error('Welcome email failed:', err.message)
  )

  revalidatePath('/admin', 'layout')
  revalidatePath('/dashboard', 'layout')
  revalidatePath('/', 'page')
  return redirect('/login?message=Check your email to confirm your account')
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/admin', 'layout')
  revalidatePath('/dashboard', 'layout')
  revalidatePath('/', 'page')
  return redirect('/')
}

export async function resetPasswordForEmail(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getURL()}api/auth/callback?next=/reset-password`,
  })

  if (error) {
    return redirect(`/forgot-password?error=${encodeURIComponent(error.message)}`)
  }

  return redirect('/forgot-password?message=Password reset link sent to your email')
}

export async function updatePassword(formData: FormData) {
  // Added log to force rebuild cache
  console.log('Update password action triggered')
  const supabase = await createClient()
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirm-password') as string

  if (!password || password.length < 8) {
    return redirect(`/reset-password?error=${encodeURIComponent('Password must be at least 8 characters')}`)
  }

  if (password !== confirmPassword) {
    return redirect(`/reset-password?error=${encodeURIComponent('Passwords do not match')}`)
  }

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return redirect(`/reset-password?error=${encodeURIComponent(error.message)}`)
  }

  // Force sign out after password reset so they have to log in with new credentials
  await supabase.auth.signOut()

  return redirect('/login?message=Password updated successfully. Please log in with your new password.')
}
