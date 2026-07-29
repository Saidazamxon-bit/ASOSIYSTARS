import { NextResponse } from 'next/server'
import { getLeaderboard, type LeaderboardPeriod } from '@/lib/server/admin-store'

const VALID_PERIODS: LeaderboardPeriod[] = ['today', 'week', 'month', 'all']

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const periodParam = searchParams.get('period') ?? 'all'
  const period = (VALID_PERIODS.includes(periodParam as LeaderboardPeriod) ? periodParam : 'all') as LeaderboardPeriod
  const rows = getLeaderboard(period, 10)
  return NextResponse.json({ ok: true, period, rows })
}
