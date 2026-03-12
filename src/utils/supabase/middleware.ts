import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Fetch Maintenance Mode Status
  const { data: settings } = await supabase
    .from('platform_settings')
    .select('maintenance_mode')
    .single()

  const isMaintenanceActive = settings?.maintenance_mode || false
  const isMaintenancePage = request.nextUrl.pathname === '/maintenance'
  const isLoginPage = request.nextUrl.pathname === '/login'
  const isSignupPage = request.nextUrl.pathname === '/signup'
  const isAuthCallback = request.nextUrl.pathname.startsWith('/auth')
  const isRootPage = request.nextUrl.pathname === '/'

  // 2. Maintenance Logic
  if (isMaintenanceActive && !isMaintenancePage && !isLoginPage && !isSignupPage && !isAuthCallback && !isRootPage) {
    if (user) {
      // Check user role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      // Redirect if not admin
      if (profile?.role !== 'admin') {
        const url = request.nextUrl.clone()
        url.pathname = '/maintenance'
        return NextResponse.redirect(url)
      }
    }
  }

  // 3. Redirect away from maintenance page if maintenance is NOT active
  if (!isMaintenanceActive && isMaintenancePage) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
