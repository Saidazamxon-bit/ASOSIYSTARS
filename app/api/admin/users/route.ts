import { NextResponse } from 'next/server'
import { listUsers, type UserStatus } from '@/lib/server/admin-store'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query') ?? ''
  const status = (searchParams.get('status') as UserStatus | 'all' | null) ?? 'all'
  const page = Number(searchParams.get('page') ?? '1') || 1
  const result = listUsers({ query, status, page, pageSize: 8 })
  return NextResponse.json({ ok: true, ...result })
}
