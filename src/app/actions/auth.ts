'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

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
    .select('role')
    .eq('id', data.user.id)
    .single()

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

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name
      }
    }
  })

  if (error) {
    return redirect(`/signup?error=${encodeURIComponent(error.message)}`)
  }

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
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/callback?next=/reset-password`,
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

  if (!password || password.length < 6) {
    return redirect(`/reset-password?error=${encodeURIComponent('Password must be at least 6 characters')}`)
  }

  if (password !== confirmPassword) {
    return redirect(`/reset-password?error=${encodeURIComponent('Passwords do not match')}`)
  }

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return redirect(`/reset-password?error=${encodeURIComponent(error.message)}`)
  }

  return redirect('/login?message=Password updated successfully. Please log in with your new password.')
}
