import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const DEFAULT_SUPABASE_URL = 'https://bfyayvnnhjsiggjoikma.supabase.co'
const DEFAULT_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmeWF5dm5uaGpzaWdnam9pa21hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0OTA3NTksImV4cCI6MjEwNDA2Njc1OX0.3Ru3Hw8b_OR6OMUr8HV2E8AGpsHlFrZt8fqRDXz3QmY'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()

  const url = (envUrl && envUrl.startsWith('http')) ? envUrl : DEFAULT_SUPABASE_URL
  const key = (envKey && envKey.length > 20) ? envKey : DEFAULT_SUPABASE_KEY

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

  // 1. Bảo vệ toàn bộ trang Admin (/admin)
  if (pathname.startsWith('/admin')) {
    if (!user) {
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // 2. Bảo vệ toàn bộ trang User (/user)
  if (pathname.startsWith('/user')) {
    if (!user) {
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // 3. Nếu đã đăng nhập mà vào lại /auth/login hoặc /auth/register -> tự động chuyển hướng vào app
  if (pathname === '/auth/login' || pathname === '/auth/register') {
    if (user) {
      const role = user.user_metadata?.role || 'user'
      const destination = role === 'admin' ? '/admin' : '/user'
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
