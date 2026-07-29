'use client'

import Link from 'next/link'
import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Crown, TrendingUp, Trophy } from 'lucide-react'
import { formatUZS } from '@/components/balance-provider'

type LeaderboardEntry = {
  rank: number
  userId: number
  username: string
  displayName: string
  vipLevel: number
  amount: number
}

type Period = 'today' | 'week' | 'month' | 'all'

const PERIODS: { key: Period; label: string }[] = [
  { key: 'today', label: 'Bugun' },
  { key: 'week', label: 'Bu hafta' },
  { key: 'month', label: 'Bu oy' },
  { key: 'all', label: 'Hammasi' },
]

const PODIUM_STYLE: Record<number, { order: string; height: string; ring: string; glow: string; crown: boolean; delay: number }> = {
  1: { order: 'order-2', height: 'h-[168px]', ring: 'border-amber-300/60', glow: 'shadow-[0_0_60px_rgba(251,191,36,0.35)]', crown: true, delay: 0.05 },
  2: { order: 'order-1', height: 'h-[132px]', ring: 'border-slate-300/50', glow: 'shadow-[0_0_40px_rgba(203,213,225,0.22)]', crown: false, delay: 0.18 },
  3: { order: 'order-3', height: 'h-[112px]', ring: 'border-orange-400/50', glow: 'shadow-[0_0_40px_rgba(251,146,60,0.22)]', crown: false, delay: 0.3 },
}

function initialsOf(name: string) {
  return name.slice(0, 2).toUpperCase()
}

export default function RatingPage() {
  const [period, setPeriod] = useState<Period>('all')
  const [rows, setRows] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (p: Period) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/leaderboard?period=${p}`, { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok || data.ok === false) throw new Error('failed')
      setRows(data.rows ?? [])
    } catch {
      setError("Reytingni yuklab bo'lmadi")
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(period)
  }, [period, load])

  const top3 = rows.slice(0, 3)
  const rest = rows.slice(3, 10)

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-[#08090F]">
      <main className="relative flex-1 overflow-y-auto px-3 py-4 pb-32">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 12%, rgba(255,255,255,0.08), transparent 22%), radial-gradient(circle at 82% 20%, rgba(255,255,255,0.06), transparent 20%), linear-gradient(135deg, #08090F 0%, #0b0d14 45%, #08090F 100%)',
            }}
          />
          <motion.div
            animate={{ x: ['-8%', '8%', '-6%'], y: ['-5%', '6%', '-2%'] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute left-[-12%] top-[-12%] h-52 w-52 rounded-full bg-[var(--accent)]/15 blur-3xl"
          />
          <motion.div
            animate={{ x: ['6%', '-10%', '5%'], y: ['4%', '-8%', '2%'] }}
            transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-[-10%] right-[-4%] h-44 w-44 rounded-full bg-white/10 blur-3xl"
          />
        </div>

        <div className="mb-4 flex items-center gap-3">
          <Link href="/profile">
            <motion.div
              whileTap={{ scale: 0.92 }}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/80"
            >
              <ArrowLeft className="h-4 w-4" />
            </motion.div>
          </Link>
          <div>
            <h1 className="flex items-center gap-2 text-xl font-semibold text-white">
              <Trophy className="h-5 w-5 text-amber-300" /> Top 10 reyting
            </h1>
            <p className="text-[11px] uppercase tracking-[0.24em] text-white/40">Eng ko'p pul solganlar</p>
          </div>
        </div>

        <div className="mb-6 flex gap-2 overflow-x-auto rounded-2xl border border-white/10 bg-white/5 p-1.5">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`relative flex-1 rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
                period === p.key ? 'text-black' : 'text-white/60 hover:text-white/90'
              }`}
            >
              {period === p.key && (
                <motion.span
                  layoutId="rating-period-pill"
                  transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                  className="absolute inset-0 rounded-xl bg-[var(--accent)]"
                />
              )}
              <span className="relative z-10">{p.label}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-sm text-white/60">
            Yuklanmoqda...
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-rose-400/25 bg-rose-500/10 p-6 text-center text-sm text-rose-100/90">
            {error}
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-black/20 p-8 text-center text-sm text-white/55">
            Bu davr uchun ma'lumot yo'q
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={period} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              {/* Top 3 podium */}
              <div className="mb-6 flex items-end justify-center gap-3">
                {top3.map((entry) => {
                  const style = PODIUM_STYLE[entry.rank]
                  return (
                    <motion.div
                      key={entry.userId}
                      initial={{ opacity: 0, y: 40, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: style.delay, type: 'spring', stiffness: 220, damping: 18 }}
                      className={`flex w-[100px] flex-col items-center ${style.order}`}
                    >
                      <div className="relative mb-2">
                        {style.crown && (
                          <motion.div
                            animate={{ y: [-3, 1, -3], rotate: [-6, 6, -6] }}
                            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                            className="absolute -top-6 left-1/2 -translate-x-1/2"
                          >
                            <Crown className="h-6 w-6 fill-amber-300 text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                          </motion.div>
                        )}
                        <motion.div
                          animate={{ scale: entry.rank === 1 ? [1, 1.05, 1] : 1 }}
                          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                          className={`flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 bg-slate-900 text-lg font-bold text-white ${style.ring} ${style.glow}`}
                        >
                          {initialsOf(entry.displayName)}
                        </motion.div>
                        <span className="absolute -bottom-1 left-1/2 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full border border-white/20 bg-[#08090F] text-[11px] font-bold text-white">
                          {entry.rank}
                        </span>
                      </div>
                      <p className="mt-2 max-w-[92px] truncate text-center text-xs font-semibold text-white">{entry.displayName}</p>
                      <p className="text-[11px] text-white/45">@{entry.username}</p>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: style.height.replace('h-[', '').replace(']', '') }}
                        transition={{ delay: style.delay + 0.1, duration: 0.5, ease: 'easeOut' }}
                        className={`mt-2 flex w-full flex-col items-center justify-start rounded-t-2xl border border-b-0 border-white/10 pt-2 ${style.order}`}
                        style={{
                          background:
                            entry.rank === 1
                              ? 'linear-gradient(180deg, rgba(251,191,36,0.22), rgba(23,26,35,0.9))'
                              : entry.rank === 2
                              ? 'linear-gradient(180deg, rgba(203,213,225,0.16), rgba(23,26,35,0.9))'
                              : 'linear-gradient(180deg, rgba(251,146,60,0.16), rgba(23,26,35,0.9))',
                        }}
                      >
                        <p className="text-[13px] font-bold text-white">{formatUZS(entry.amount)}</p>
                        <p className="text-[9px] uppercase tracking-wider text-white/40">so'm</p>
                      </motion.div>
                    </motion.div>
                  )
                })}
              </div>

              {/* Ranks 4-10 */}
              <div className="space-y-2">
                {rest.map((entry, i) => (
                  <motion.div
                    key={entry.userId}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + i * 0.05, duration: 0.35 }}
                    whileHover={{ y: -2, scale: 1.01 }}
                    className="flex items-center gap-3 rounded-[20px] border border-white/10 p-3"
                    style={{ background: 'linear-gradient(145deg, rgba(23,26,35,0.92), rgba(17,19,26,0.94))' }}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs font-bold text-white/70">
                      {entry.rank}
                    </div>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-slate-900 text-sm font-semibold text-white/90">
                      {initialsOf(entry.displayName)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">{entry.displayName}</p>
                      <p className="truncate text-xs text-white/45">@{entry.username}</p>
                    </div>
                    <div className="flex items-center gap-1 text-right">
                      <TrendingUp className="h-3.5 w-3.5 text-[var(--accent)]" />
                      <p className="text-sm font-semibold text-white">{formatUZS(entry.amount)}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </main>
    </div>
  )
}
