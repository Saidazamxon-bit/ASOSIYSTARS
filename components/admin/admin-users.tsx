'use client'

import { useEffect, useState } from 'react'
import { Search, ChevronLeft, ChevronRight, RefreshCcw, Wallet } from 'lucide-react'
import { formatCurrency } from '@/lib/application-settings'

type UserStatus = 'active' | 'suspended' | 'banned'

type AdminUser = {
  id: number
  telegramId: string
  username: string
  displayName: string
  language: string
  vipLevel: number
  status: UserStatus
  riskScore: number
  currency: string
  balance: number
  frozenBalance: number
  createdAt: string
  updatedAt: string
}

const STATUS_LABEL: Record<UserStatus, string> = {
  active: 'Faol',
  suspended: 'To‘xtatilgan',
  banned: 'Bloklangan',
}

const STATUS_STYLE: Record<UserStatus, string> = {
  active: 'bg-emerald-500/10 text-emerald-300',
  suspended: 'bg-amber-500/10 text-amber-300',
  banned: 'bg-rose-500/10 text-rose-400',
}

// use centralized formatter

export function AdminUsers({ onMutate }: { onMutate: () => void }) {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [status, setStatus] = useState<UserStatus | 'all'>('all')
  const [page, setPage] = useState(1)
  const [rows, setRows] = useState<AdminUser[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [balanceModalUser, setBalanceModalUser] = useState<AdminUser | null>(null)
  const [pendingUserId, setPendingUserId] = useState<number | null>(null)

  // Debounce the raw input into `debouncedQuery` so typing doesn't fire a
  // request per keystroke; the actual fetch effect below reacts to that.
  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(query.trim()), 300)
    return () => clearTimeout(timeout)
  }, [query])

  // Reset to page 1 whenever the effective filters change.
  useEffect(() => {
    setPage(1)
  }, [debouncedQuery, status])

  const load = () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), status })
    if (debouncedQuery) params.set('query', debouncedQuery)
    fetch(`/api/admin/users?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setRows(data?.rows ?? [])
        setTotal(data?.total ?? 0)
        setTotalPages(data?.totalPages ?? 1)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status, debouncedQuery])

  async function changeStatus(user: AdminUser, next: UserStatus) {
    if (next === user.status) return
    setPendingUserId(user.id)
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status: next }),
      })
      if (res.ok) {
        load()
        onMutate()
      }
    } finally {
      setPendingUserId(null)
    }
  }

  async function changeVip(user: AdminUser, delta: number) {
    const nextLevel = Math.max(0, Math.min(10, user.vipLevel + delta))
    if (nextLevel === user.vipLevel) return
    setPendingUserId(user.id)
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ vipLevel: nextLevel }),
      })
      if (res.ok) {
        load()
        onMutate()
      }
    } finally {
      setPendingUserId(null)
    }
  }

  return (
    <section className="rounded-3xl border border-border bg-card p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Foydalanuvchilar</h2>
          <p className="mt-1 text-sm text-muted-foreground">Qidiring, statusni o‘zgartiring, VIP darajasini va balansni boshqaring.</p>
        </div>
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-2 self-start rounded-2xl border border-border bg-secondary px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-secondary/80"
        >
          <RefreshCcw className="size-3.5" aria-hidden="true" /> Yangilash
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Username, ism yoki Telegram ID bo'yicha qidirish"
            className="w-full rounded-2xl border border-border bg-input px-4 py-2.5 pl-9 text-sm text-foreground"
          />
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as UserStatus | 'all')}
          className="rounded-2xl border border-border bg-input px-4 py-2.5 text-sm text-foreground"
        >
          <option value="all">Barcha statuslar</option>
          <option value="active">Faol</option>
          <option value="suspended">To‘xtatilgan</option>
          <option value="banned">Bloklangan</option>
        </select>
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-secondary/60 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Foydalanuvchi</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">VIP</th>
              <th className="px-4 py-3">Xavf</th>
              <th className="px-4 py-3">Balans</th>
              <th className="px-4 py-3 text-right">Amallar</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Yuklanmoqda...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Hech narsa topilmadi.
                </td>
              </tr>
            ) : (
              rows.map((user) => (
                <tr key={user.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-foreground">{user.displayName}</div>
                    <div className="text-xs text-muted-foreground">@{user.username} · #{user.telegramId}</div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={user.status}
                      disabled={pendingUserId === user.id}
                      onChange={(e) => changeStatus(user, e.target.value as UserStatus)}
                      className={`rounded-full border-0 px-3 py-1 text-xs font-bold ${STATUS_STYLE[user.status]}`}
                    >
                      <option value="active">{STATUS_LABEL.active}</option>
                      <option value="suspended">{STATUS_LABEL.suspended}</option>
                      <option value="banned">{STATUS_LABEL.banned}</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={pendingUserId === user.id || user.vipLevel <= 0}
                        onClick={() => changeVip(user, -1)}
                        className="flex size-6 items-center justify-center rounded-full border border-border text-xs disabled:opacity-30"
                      >
                        −
                      </button>
                      <span className="w-6 text-center font-semibold text-gold">{user.vipLevel}</span>
                      <button
                        type="button"
                        disabled={pendingUserId === user.id || user.vipLevel >= 10}
                        onClick={() => changeVip(user, 1)}
                        className="flex size-6 items-center justify-center rounded-full border border-border text-xs disabled:opacity-30"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={user.riskScore >= 70 ? 'font-semibold text-rose-400' : 'text-muted-foreground'}>
                      {user.riskScore.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-foreground">{formatCurrency(user.balance, user.currency)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setBalanceModalUser(user)}
                      className="inline-flex items-center gap-1.5 rounded-2xl border border-border bg-secondary px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-secondary/80"
                    >
                      <Wallet className="size-3.5" aria-hidden="true" /> Balans
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <span>Jami: {total} foydalanuvchi</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="flex size-8 items-center justify-center rounded-xl border border-border disabled:opacity-30"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </button>
          <span>
            {page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="flex size-8 items-center justify-center rounded-xl border border-border disabled:opacity-30"
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {balanceModalUser ? (
        <BalanceModal
          user={balanceModalUser}
          onClose={() => setBalanceModalUser(null)}
          onDone={() => {
            setBalanceModalUser(null)
            load()
            onMutate()
          }}
        />
      ) : null}
    </section>
  )
}

function BalanceModal({ user, onClose, onDone }: { user: AdminUser; onClose: () => void; onDone: () => void }) {
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(sign: 1 | -1) {
    const value = Number(amount)
    if (!Number.isFinite(value) || value <= 0) {
      setError('Miqdorni to‘g‘ri kiriting')
      return
    }
    if (!reason.trim()) {
      setError('Sababni kiritish shart')
      return
    }
    setBusy(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/users/${user.id}/balance`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ amount: value * sign, reason: reason.trim() }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        setError(data?.error ?? 'Xatolik yuz berdi')
        return
      }
      onDone()
    } catch (e) {
      setError(String(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 px-4 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} role="button" aria-label="Yopish" />
      <div className="relative z-10 w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl">
        <h3 className="text-lg font-bold">Balansni sozlash</h3>
          <p className="mt-1 text-sm text-muted-foreground">
          {user.displayName} (@{user.username}) — joriy balans: {formatCurrency(user.balance, user.currency)}
        </p>

        <div className="mt-4 space-y-3">
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-semibold">Miqdor ({user.currency})</span>
            <input
              type="number"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Masalan: 50000"
              className="rounded-2xl border border-border bg-input px-4 py-2.5 text-sm text-foreground"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-semibold">Sabab</span>
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Masalan: Support ticket #1245 bo'yicha qaytarish"
              className="rounded-2xl border border-border bg-input px-4 py-2.5 text-sm text-foreground"
            />
          </label>
          {error ? <p className="text-xs text-rose-400">{error}</p> : null}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => submit(1)}
            className="rounded-2xl bg-emerald-500/15 px-4 py-3 text-sm font-bold text-emerald-300 transition hover:bg-emerald-500/25 disabled:opacity-50"
          >
            {busy ? 'Kuting...' : '+ Qo‘shish'}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => submit(-1)}
            className="rounded-2xl bg-rose-500/15 px-4 py-3 text-sm font-bold text-rose-400 transition hover:bg-rose-500/25 disabled:opacity-50"
          >
            {busy ? 'Kuting...' : '− Yechish'}
          </button>
        </div>
        <button type="button" onClick={onClose} className="mt-3 w-full rounded-2xl border border-border px-4 py-2.5 text-sm text-muted-foreground">
          Bekor qilish
        </button>
      </div>
    </div>
  )
}
