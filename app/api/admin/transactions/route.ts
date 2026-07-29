import { NextResponse } from 'next/server'
import { listTransactions } from '@/lib/server/admin-store'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') ?? 'all'
  const page = Number(searchParams.get('page') ?? '1') || 1
  const userId = searchParams.get('userId')
  const result = listTransactions({ type, page, pageSize: 10, userId: userId ? Number(userId) : undefined })
  return NextResponse.json({ ok: true, ...result })
}
