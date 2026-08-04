import { NextResponse } from 'next/server'
import { phpAdminFetch, PhpAdminError } from '@/lib/server/php-admin'

// Haqiqiy PHP bazadagi statistika — starsSold/premiumSold/giftsSold ham shu
// yerdan keladi (avval bu maydonlar mock do'konda umuman yo'q edi).
export async function GET() {
  try {
    const data = await phpAdminFetch('/api/admin/stats.php')
    return NextResponse.json({ ok: true, stats: data.stats })
  } catch (err) {
    const status = err instanceof PhpAdminError ? err.status : 500
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : String(err) }, { status })
  }
}
