import { NextResponse } from 'next/server'
import { listAuditLogs } from '@/lib/server/admin-store'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = Number(searchParams.get('page') ?? '1') || 1
  const result = listAuditLogs({ page, pageSize: 10 })
  return NextResponse.json({ ok: true, ...result })
}
