'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatCurrency } from '@/lib/application-settings'

type Transaction = {
  id: number
  userId: number
  amount: number
  currency: string
  type: string
  status: string
  reason?: string
  createdAt: string
}

const TYPE_LABEL: Record<string, string> = {
  deposit: 'Depozit',
  withdraw: 'Yechish',
  purchase: 'Xarid',
  refund: 'Qaytarish',
  reward: 'Mukofot',
  referral_bonus: 'Referal bonusi',
  case_opening: 'Keys ochish',
  item_sell: 'Buyum sotish',
  admin_adjustment: 'Admin tuzatishi',
  chargeback: 'Chargeback',
}

// use centralized formatter

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('uz-UZ', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export function AdminTransactions({ refreshKey }: { refreshKey: number }) {
  const [type, setType] = useState('all')
  const [page, setPage] = useState(1)
  const [rows, setRows] = useState<Transaction[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), type })
    fetch(`/api/admin/transactions?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setRows(data?.rows ?? [])
        setTotal(data?.total ?? 0)
        setTotalPages(data?.totalPages ?? 1)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [page, type, refreshKey])

  return (
    <section className="rounded-3xl border border-border bg-card p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Tranzaksiyalar</h2>
          <p className="mt-1 text-sm text-muted-foreground">Barcha depozit, xarid va admin tuzatishlari shu yerda ko‘rinadi.</p>
        </div>
        <select
          value={type}
          onChange={(e) => {
            setType(e.target.value)
            setPage(1)
          }}
          className="rounded-2xl border border-border bg-input px-4 py-2.5 text-sm text-foreground"
        >
          <option value="all">Barcha turlar</option>
          {Object.entries(TYPE_LABEL).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-secondary/60 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Foydalanuvchi ID</th>
              <th className="px-4 py-3">Tur</th>
              <th className="px-4 py-3">Miqdor</th>
              <th className="px-4 py-3">Holat</th>
              <th className="px-4 py-3">Sana</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  Yuklanmoqda...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  Tranzaksiyalar topilmadi.
                </td>
              </tr>
            ) : (
              rows.map((tx) => (
                <tr key={tx.id} className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">#{tx.userId}</td>
                  <td className="px-4 py-3">{TYPE_LABEL[tx.type] ?? tx.type}</td>
                  <td className="px-4 py-3 font-semibold text-foreground">{formatCurrency(tx.amount, tx.currency)}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-300">{tx.status}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(tx.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <span>Jami: {total} tranzaksiya</span>
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
    </section>
  )
}
