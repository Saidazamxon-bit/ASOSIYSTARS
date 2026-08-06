import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const TELEGRAM_WEB_HOSTS = ['web.telegram.org', 'webk.telegram.org']

function isWebTelegramHost(hostname: string) {
  const normalized = hostname.toLowerCase()
  return TELEGRAM_WEB_HOSTS.some((host) => normalized === host || normalized.endsWith(`.${host}`))
}

function isTelegramUserAgent(agent: string | null) {
  if (!agent) return false
  return /telegram/i.test(agent)
}

export function middleware(req: NextRequest) {
  const { pathname, searchParams, hostname } = req.nextUrl
  const ua = req.headers.get('user-agent') || ''

  const isLocalhost = hostname === 'localhost' || hostname.startsWith('127.') || hostname === '::1'

  if (!isLocalhost && isWebTelegramHost(hostname)) {
    return new NextResponse('Not Found', { status: 404 })
  }

  if (!isLocalhost && !isTelegramUserAgent(ua)) {
    return new NextResponse('Not Found', { status: 404 })
  }

  // Allow all requests from localhost or Telegram user agents.
  if (pathname.startsWith('/admin')) {
    if (!isLocalhost) {
      const proto = req.headers.get('x-forwarded-proto') || req.nextUrl.protocol
      if (proto && proto !== 'https') {
        const url = req.nextUrl.clone()
        url.protocol = 'https'
        return NextResponse.redirect(url)
      }
    }

    const ADMIN_SECRET = process.env.ADMIN_SECRET || ''
    if (!ADMIN_SECRET) return new NextResponse('Not Found', { status: 404 })

    const cookie = req.cookies.get('admin_auth')?.value
    if (cookie && cookie === ADMIN_SECRET) return NextResponse.next()

    const secretParam = searchParams.get('admin_secret')
    if (secretParam && secretParam === ADMIN_SECRET) {
      const res = NextResponse.next()
      res.cookies.set('admin_auth', ADMIN_SECRET, {
        httpOnly: true,
        secure: !isLocalhost,
        path: '/admin',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24,
      })
      return res
    }

    return new NextResponse('Not Found', { status: 404 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/:path*'],
}
