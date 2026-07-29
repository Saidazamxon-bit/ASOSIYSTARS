import { NextResponse } from 'next/server'
import { getUser, getUserTransactions, updateUser, type UserStatus } from '@/lib/server/admin-store'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = getUser(Number(id))
  if (!user) return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 })
  const transactions = getUserTransactions(user.id)
  return NextResponse.json({ ok: true, user, transactions })
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const body = await request.json()
    const patch: { status?: UserStatus; vipLevel?: number; displayName?: string } = {}
    if (body.status) patch.status = body.status
    if (body.vipLevel !== undefined) patch.vipLevel = Number(body.vipLevel)
    if (body.displayName) patch.displayName = String(body.displayName)

    const user = updateUser(Number(id), patch)
    if (!user) return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 })
    return NextResponse.json({ ok: true, user })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 400 })
  }
}
