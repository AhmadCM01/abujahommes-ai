import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Lightweight edge middleware.
 * Rule: Middleware may ONLY bounce missing cookies.
 * Full authoritative verification for pending/suspended users is enforced
 * server-side in the dashboard root layout.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Intercept default Better Auth error page and redirect to in-app login/error experience
  if (pathname === '/api/auth/error') {
    const errorParam = request.nextUrl.searchParams.get('error') || 'unknown'
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('error', errorParam)
    return NextResponse.redirect(loginUrl)
  }

  if (pathname.startsWith('/dashboard')) {
    const sessionToken =
      request.cookies.get('better-auth.session_token') ||
      request.cookies.get('__Secure-better-auth.session_token')

    if (!sessionToken?.value) {
      // Safe relative redirect parameter only
      const safeRedirect = pathname.startsWith('/') && !pathname.startsWith('//') ? pathname : '/dashboard'
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('redirect', safeRedirect)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/auth/error'],
}
