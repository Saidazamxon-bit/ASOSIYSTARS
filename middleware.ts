import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Protect the /admin route and enforce HTTPS in production-like hosts.
export function middleware(req: NextRequest) {
  const { pathname, searchParams, hostname } = req.nextUrl

  // Only run for /admin paths
  if (!pathname.startsWith('/admin')) return NextResponse.next()

  // Allow local dev hosts to bypass HTTPS enforcement
  const isLocalhost = hostname === 'localhost' || hostname.startsWith('127.') || hostname === '::1'

  // Enforce HTTPS for non-localhost hosts when behind proxies (x-forwarded-proto)
  if (!isLocalhost) {
    const proto = req.headers.get('x-forwarded-proto') || req.nextUrl.protocol
    if (proto && proto !== 'https') {
      const url = req.nextUrl.clone()
      url.protocol = 'https'
      return NextResponse.redirect(url)
    }
  }

  const ADMIN_SECRET = process.env.ADMIN_SECRET || ''

  // If no secret configured, deny access (fail closed)
  if (!ADMIN_SECRET) return new NextResponse('Not Found', { status: 404 })

  // Check cookie-based auth
  const cookie = req.cookies.get('admin_auth')?.value
  if (cookie && cookie === ADMIN_SECRET) return NextResponse.next()

  // Allow one-time login via ?admin_secret=... which sets a secure httpOnly cookie
  const secretParam = searchParams.get('admin_secret')
  if (secretParam && secretParam === ADMIN_SECRET) {
    const res = NextResponse.next()
    res.cookies.set('admin_auth', ADMIN_SECRET, {
      httpOnly: true,
      secure: !isLocalhost,
      path: '/admin',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 1 day
    })
    return res
  }

  // Hide admin presence by returning 404 when not authorized
  return new NextResponse('Not Found', { status: 404 })
}

export const config = {
  matcher: ['/admin/:path*', '/admin'],
}
