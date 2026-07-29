import { NextResponse } from 'next/server'
import { getStats } from '@/lib/server/admin-store'

export async function GET() {
  return NextResponse.json({ ok: true, stats: getStats() })
}
