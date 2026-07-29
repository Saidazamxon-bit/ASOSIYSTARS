'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, History } from 'lucide-react'

type AuditLog = {
  id: number
  actor: string
  targetType: string
  targetId: number
  action: string
  oldValue?: unknown
  newValue?: unknown
  createdAt: string
}

const ACTION_LABEL: Record<string, string> = {
  update_user: 'Foydalanuvchi yangilandi',
  credit_balance: 'Balansga qo‘shildi',
  debit_balance: 'Balansdan yechildi',
  seed: 'Boshlang‘ich ma’lumot',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('uz-UZ', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export function AdminAuditLog({ refreshKey }: { refreshKey: number }) {
  const [page, setPage] = useState(1)
  const [rows, setRows] = useState<AuditLog[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/admin/audit-logs?page=${page}`)
      .then((res) => res.json())
      .then((data) => {
        setRows(data?.rows ?? [])
        setTotal(data?.total ?? 0)
        setTotalPages(data?.totalPages ?? 1)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [page, refreshKey])

  useEffect(() => {
    setPage(1)
  }, [refreshKey])

  return (
    <section className="rounded-3xl border border-border bg-card p-6">
      <div className="flex items-center gap-3 text-teal-badge">
        <History className="size-5" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-foreground">Audit jurnali</h2>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">Admin tomonidan qilingan har bir amal shu yerda avtomatik qayd etiladi.</p>

      <div className="mt-4 space-y-2">
        {loading ? (
          <div className="rounded-2xl border border-border bg-background/70 p-4 text-center text-sm text-muted-foreground">Yuklanmoqda...</div>
        ) : rows.length === 0 ? (
          <div className="rounded-2xl border border-border bg-background/70 p-4 text-center text-sm text-muted-foreground">Hali hech qanday amal qayd etilmagan.</div>
        ) : (
          rows.map((log) => (
            <div key={log.id} className="rounded-2xl border border-border bg-background/70 p-4 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold text-foreground">{ACTION_LABEL[log.action] ?? log.action}</span>
                <span className="text-xs text-muted-foreground">{formatDate(log.createdAt)}</span>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {log.actor} → {log.targetType} #{log.targetId}
              </div>
              {log.newValue ? (
                <pre className="mt-2 overflow-x-auto rounded-xl bg-secondary/60 p-2 text-[11px] text-muted-foreground">
                  {JSON.stringify(log.newValue)}
                </pre>
              ) : null}
            </div>
          ))
        )}
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <span>Jami: {total} yozuv</span>
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
