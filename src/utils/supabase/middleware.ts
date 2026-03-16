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

  const isMaintenancePage = request.nextUrl.pathname === '/maintenance'
  const isLoginPage = request.nextUrl.pathname === '/login'
  const isSignupPage = request.nextUrl.pathname === '/signup'
  const isAuthCallback = request.nextUrl.pathname.startsWith('/auth')
  const isRootPage = request.nextUrl.pathname === '/'
  const isPublicPage = isRootPage || isLoginPage || isSignupPage || isAuthCallback || isMaintenancePage

  // 1. Only fetch Maintenance Mode Status if NOT on a public page or if we need to block access
  // For better performance, we'll only check maintenance for non-public routes
  if (!isPublicPage) {
    const { data: settings } = await supabase
      .from('platform_settings')
      .select('maintenance_mode')
      .single()

    const isMaintenanceActive = settings?.maintenance_mode || false

    if (isMaintenanceActive) {
      if (user) {
        // Only fetch profile if maintenance is active to save a query
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (profile?.role !== 'admin') {
          const url = request.nextUrl.clone()
          url.pathname = '/maintenance'
          return NextResponse.redirect(url)
        }
      } else {
        // For unauthorized users on non-public pages during maintenance
        const url = request.nextUrl.clone()
        url.pathname = '/maintenance'
        return NextResponse.redirect(url)
      }
    }
  }

  // 2. Redirect away from maintenance page if maintenance is NOT active (handled naturally by not redirecting for isMaintenancePage if not maintenance)
  if (isMaintenancePage) {
    const { data: settings } = await supabase
      .from('platform_settings')
      .select('maintenance_mode')
      .single()
    
    if (!settings?.maintenance_mode) {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
