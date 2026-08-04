import { NextRequest, NextResponse } from 'next/server'
import { phpAdminFetch, PhpAdminError } from '@/lib/server/php-admin'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') ?? 'all'
  const page = searchParams.get('page') ?? '1'
  const userId = searchParams.get('userId')

  try {
    const qs = new URLSearchParams({ type, page })
    if (userId) qs.set('userId', userId)
    const data = await phpAdminFetch(`/api/admin/transactions.php?${qs.toString()}`)
    return NextResponse.json({ ok: true, rows: data.rows, total: data.total, page: data.page, pageSize: data.pageSize, totalPages: data.totalPages })
  } catch (err) {
    const status = err instanceof PhpAdminError ? err.status : 500
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : String(err) }, { status })
  }
}
