import { NextResponse } from 'next/server'

const sessions = [
  { id: 'local-1', device: 'Windows 11 – Chrome', ip: '91.210.178.36', lastSeen: '2026-07-22T22:12:00Z', current: true },
  { id: 'local-2', device: 'Android 14 – Telegram', ip: '172.56.33.14', lastSeen: '2026-07-22T19:34:00Z' },
  { id: 'local-3', device: 'macOS Sonoma – Safari', ip: '94.38.107.92', lastSeen: '2026-07-21T08:22:00Z' },
]

export async function GET() {
  return NextResponse.json({ ok: true, sessions })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    if (body.action === 'revoke' && body.id) {
      const index = sessions.findIndex((item) => item.id === body.id)
      if (index >= 0) sessions.splice(index, 1)
      return NextResponse.json({ ok: true })
    }
    return NextResponse.json({ ok: false, error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ ok: false, error: 'Bad request' }, { status: 400 })
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json()
    const id = body?.sessionId ?? body?.id
    if (!id) {
      return NextResponse.json({ ok: false, error: 'Missing sessionId' }, { status: 400 })
    }
    const index = sessions.findIndex((item) => item.id === id)
    if (index >= 0) {
      if (sessions[index].current) {
        return NextResponse.json({ ok: false, error: 'Cannot revoke current session' }, { status: 400 })
      }
      sessions.splice(index, 1)
    }
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ ok: false, error: 'Bad request' }, { status: 400 })
  }
}
