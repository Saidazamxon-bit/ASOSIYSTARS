import { NextRequest, NextResponse } from 'next/server'
import { phpAdminFetch, PhpAdminError } from '@/lib/server/php-admin'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = searchParams.get('page') ?? '1'

  try {
    const qs = new URLSearchParams({ page }).toString()
    const data = await phpAdminFetch(`/api/admin/audit_logs.php?${qs}`)
    return NextResponse.json({ ok: true, rows: data.rows, total: data.total, page: data.page, pageSize: data.pageSize, totalPages: data.totalPages })
  } catch (err) {
    const status = err instanceof PhpAdminError ? err.status : 500
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : String(err) }, { status })
  }
}
