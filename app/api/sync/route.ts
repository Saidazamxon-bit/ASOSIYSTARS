import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { randomUUID } from 'crypto'

// Dev-grade persistence: keeps last-synced settings per browser (identified by
// an httpOnly cookie) for the lifetime of the server process. Good enough to
// make "sync now" / "restore from cloud" actually round-trip during local use
// and testing; swap for a real DB-backed store (keyed by the Telegram user
// id) before shipping to production.
const store = new Map<string, unknown>()
const COOKIE_NAME = 'ultra_uid'

export async function GET() {
  const cookieStore = await cookies()
  const uid = cookieStore.get(COOKIE_NAME)?.value
  const settings = uid ? store.get(uid) ?? null : null
  return NextResponse.json({ ok: true, settings })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const cookieStore = await cookies()
    let uid = cookieStore.get(COOKIE_NAME)?.value

    const response = NextResponse.json({ ok: true, settings: body })

    if (!uid) {
      uid = randomUUID()
      response.cookies.set(COOKIE_NAME, uid, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
      })
    }

    store.set(uid, body)
    return response
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
