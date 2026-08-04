'use client'

import { useEffect, useState } from 'react'
import { Users, Wallet, TrendingUp, ShieldAlert, UserX, UserCheck, Star, Crown, Gift } from 'lucide-react'

type Stats = {
  totalUsers: number
  activeUsers: number
  suspendedUsers: number
  bannedUsers: number
  totalBalance: number
  transactions24h: number
  volume24h: number
  highRiskUsers: number
  starsSold?: number
  premiumSold?: number
  giftsSold?: number
  totalRevenue?: number
  pendingOrders?: number
  pendingTopups?: number
}

function formatSum(n: number) {
  return `${Math.round(n).toLocaleString('uz-UZ').replace(/,/g, ' ')} UZS`
}

export function AdminStats({ refreshKey }: { refreshKey: number }) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch('/api/admin/stats')
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setStats(data?.stats ?? null)
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [refreshKey])

  const cards = [
    { label: 'Jami foydalanuvchilar', value: stats?.totalUsers, icon: Users, color: 'text-violet-brand' },
    { label: 'Faol', value: stats?.activeUsers, icon: UserCheck, color: 'text-emerald-400' },
    { label: 'Bloklangan / to‘xtatilgan', value: stats ? stats.bannedUsers + stats.suspendedUsers : undefined, icon: UserX, color: 'text-rose-400' },
    { label: 'Yuqori xavf darajasi', value: stats?.highRiskUsers, icon: ShieldAlert, color: 'text-amber-400' },
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-3xl border border-border bg-card p-5">
          <div className={`flex items-center gap-2 ${card.color}`}>
            <card.icon className="size-5" aria-hidden="true" />
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{card.label}</span>
          </div>
          <div className="mt-3 text-2xl font-bold text-foreground">
            {loading ? '—' : (card.value ?? 0).toLocaleString('uz-UZ')}
          </div>
        </div>
      ))}
      <div className="rounded-3xl border border-border bg-card p-5 sm:col-span-2">
        <div className="flex items-center gap-2 text-gold">
          <Wallet className="size-5" aria-hidden="true" />
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Umumiy balans</span>
        </div>
        <div className="mt-3 text-2xl font-bold text-foreground">{loading ? '—' : formatSum(stats?.totalBalance ?? 0)}</div>
      </div>
      <div className="rounded-3xl border border-border bg-card p-5 sm:col-span-2">
        <div className="flex items-center gap-2 text-teal-badge">
          <TrendingUp className="size-5" aria-hidden="true" />
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">So‘nggi 24 soat aylanmasi</span>
        </div>
        <div className="mt-3 text-2xl font-bold text-foreground">
          {loading ? '—' : `${formatSum(stats?.volume24h ?? 0)} · ${stats?.transactions24h ?? 0} ta tranzaksiya`}
        </div>
      </div>

      {/* Sotib olingan Stars/Premium/Gift — haqiqiy `orders` jadvalidan (monitoring shu yerda ko'rinadi) */}
      <div className="rounded-3xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 text-[#FFD54A]">
          <Star className="size-5" aria-hidden="true" />
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sotilgan Stars</span>
        </div>
        <div className="mt-3 text-2xl font-bold text-foreground">
          {loading ? '—' : (stats?.starsSold ?? 0).toLocaleString('uz-UZ')}
        </div>
      </div>
      <div className="rounded-3xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 text-purple-400">
          <Crown className="size-5" aria-hidden="true" />
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sotilgan Premium</span>
        </div>
        <div className="mt-3 text-2xl font-bold text-foreground">
          {loading ? '—' : (stats?.premiumSold ?? 0).toLocaleString('uz-UZ')}
        </div>
      </div>
      <div className="rounded-3xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 text-pink-400">
          <Gift className="size-5" aria-hidden="true" />
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sotilgan Giftlar</span>
        </div>
        <div className="mt-3 text-2xl font-bold text-foreground">
          {loading ? '—' : (stats?.giftsSold ?? 0).toLocaleString('uz-UZ')}
        </div>
      </div>
      <div className="rounded-3xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 text-emerald-400">
          <Wallet className="size-5" aria-hidden="true" />
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Jami xarid aylanmasi</span>
        </div>
        <div className="mt-3 text-2xl font-bold text-foreground">
          {loading ? '—' : formatSum(stats?.totalRevenue ?? 0)}
        </div>
      </div>
    </div>
  )
}
