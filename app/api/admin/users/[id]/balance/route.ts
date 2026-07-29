import { NextResponse } from 'next/server'
import { adjustBalance } from '@/lib/server/admin-store'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const body = await request.json()
    const amount = Number(body.amount)
    const reason = String(body.reason ?? '').trim()

    if (!Number.isFinite(amount) || amount === 0) {
      return NextResponse.json({ ok: false, error: 'Amount must be a non-zero number' }, { status: 400 })
    }
    if (!reason) {
      return NextResponse.json({ ok: false, error: 'Reason is required for balance adjustments' }, { status: 400 })
    }

    const result = adjustBalance(Number(id), amount, reason)
    if (!result) return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 })
    if ('error' in result) return NextResponse.json({ ok: false, error: 'Insufficient balance' }, { status: 400 })

    return NextResponse.json({ ok: true, user: result.user, transaction: result.tx })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 400 })
  }
}
