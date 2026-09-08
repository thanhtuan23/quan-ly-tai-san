import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    return response
  }

  const supabase = createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  // console.log('[PROXY]', pathname, '| user:', user?.id ?? 'unauthenticated', '| email:', user?.email ?? '-')

  // 1. Bảo vệ toàn bộ trang Admin (/admin)
  if (pathname.startsWith('/admin')) {
    if (!user) {
      // console.log('[PROXY] /admin → no user → redirect to /auth/login')
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(loginUrl)
    }

    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, status, custom_role')
        .eq('id', user.id)
        .single()

      // console.log('[PROXY] /admin profile from DB:', profile, '| error:', profileError?.message ?? null)

      if (profile) {
        if (profile.status && profile.status !== 'active') {
          // console.log('[PROXY] /admin → account blocked (status:', profile.status, ') → redirect to /auth/login')
          const loginUrl = new URL('/auth/login', request.url)
          loginUrl.searchParams.set('error', 'blocked')
          return NextResponse.redirect(loginUrl)
        }

        let role = profile.role || user.user_metadata?.role || 'user'
        if (profile.role === 'admin' || profile.custom_role === 'admin') role = 'admin'
        else if (profile.role === 'manager' || profile.custom_role === 'manager') role = 'manager'

        // console.log('[PROXY] /admin → resolved role:', role, '| profile.role:', profile.role, '| custom_role:', profile.custom_role)

        // Chặn người dùng thông thường (role 'user') không được vào trang Admin
        if (role !== 'admin' && role !== 'manager') {
          // console.log('[PROXY] /admin → role is user → redirect to /user')
          return NextResponse.redirect(new URL('/user', request.url))
        }

        // console.log('[PROXY] /admin → access GRANTED for role:', role)
      } else {
        const role = user.user_metadata?.role || 'user'
        // console.log('[PROXY] /admin → no profile in DB, fallback to user_metadata role:', role)
        if (role !== 'admin' && role !== 'manager') {
          // console.log('[PROXY] /admin → fallback role is user → redirect to /user')
          return NextResponse.redirect(new URL('/user', request.url))
        }
      }
    } catch (e) {
      // console.error('[PROXY] /admin → error fetching profile:', e)
    }
  }

  // 2. Bảo vệ toàn bộ trang User (/user)
  if (pathname.startsWith('/user')) {
    if (!user) {
      //console.log('[PROXY] /user → no user → redirect to /auth/login')
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(loginUrl)
    }
    console.log('[PROXY] /user → access GRANTED')
  }

  // 3. Nếu đã đăng nhập mà vào lại /auth/login hoặc /auth/register -> tự động chuyển hướng vào app
  if (pathname === '/auth/login' || pathname === '/auth/register') {
    if (user) {
      let role = user.user_metadata?.role || 'user'
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, custom_role')
          .eq('id', user.id)
          .single()

        console.log('[PROXY] auth page → profile:', profile)

        if (profile) {
          if (profile.role === 'admin' || profile.custom_role === 'admin') role = 'admin'
          else if (profile.role === 'manager' || profile.custom_role === 'manager') role = 'manager'
          else if (profile.role) role = profile.role
        }
      } catch (e) {
        console.error('[PROXY] auth page → error fetching profile:', e)
      }

      const destination = (role === 'admin' || role === 'manager') ? '/admin' : '/user'
      // console.log('[PROXY] auth page → already logged in, role:', role, '→ redirect to:', destination)
      return NextResponse.redirect(new URL(destination, request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/user/:path*',
    '/auth/login',
    '/auth/register',
  ],
}
