import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  // The `/api/auth/callback` route is required for the server-side auth flow implemented
  // by the SSR package. It exchanges an auth code for the user's session.
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next')

  if (code) {
    const supabase = await createClient()
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      console.log('Auth success:', data.user?.email)
      if (next) {
        return NextResponse.redirect(`${requestUrl.origin}${next}`)
      }
      return NextResponse.redirect(`${requestUrl.origin}/`)
    } else {
      console.error('Auth callback error:', error.message)
    }
  } else {
    console.error('Auth callback error: No code provided')
  }

  // return the user to an error page with some instructions
  return NextResponse.redirect(`${requestUrl.origin}/login?error=Could not authenticate user`)
}
