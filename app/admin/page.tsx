'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, LayoutDashboard, Users, Receipt, History } from 'lucide-react'
import { useAppSettings } from '@/lib/application-settings'
import dynamic from 'next/dynamic'

const AdminStats = dynamic(() => import('@/components/admin/admin-stats').then((m) => m.AdminStats), { ssr: false })
const AdminUsers = dynamic(() => import('@/components/admin/admin-users').then((m) => m.AdminUsers), { ssr: false })
const AdminTransactions = dynamic(() => import('@/components/admin/admin-transactions').then((m) => m.AdminTransactions), { ssr: false })
const AdminAuditLog = dynamic(() => import('@/components/admin/admin-audit-log').then((m) => m.AdminAuditLog), { ssr: false })

type Tab = 'overview' | 'users' | 'transactions' | 'audit'

const TABS: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Umumiy ko‘rinish', icon: LayoutDashboard },
  { id: 'users', label: 'Foydalanuvchilar', icon: Users },
  { id: 'transactions', label: 'Tranzaksiyalar', icon: Receipt },
  { id: 'audit', label: 'Audit jurnali', icon: History },
]

export default function AdminPage() {
  const { settings, syncing } = useAppSettings()
  const [tab, setTab] = useState<Tab>('overview')
  const [refreshKey, setRefreshKey] = useState(0)

  const bumpRefresh = () => setRefreshKey((k) => k + 1)

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <section className="mb-6 overflow-hidden rounded-[32px] border border-white/10 bg-[#0b1020]/95 p-6 shadow-[0_32px_100px_rgba(0,0,0,0.25)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-[0.32em] text-white/40">Admin panel</p>
            <h1 className="text-3xl font-semibold text-white">Admin Dashboard</h1>
            <p className="max-w-2xl text-sm leading-6 text-white/60">
              Foydalanuvchilarni, balanslarni va tizim holatini boshqarish. Har bir harakat aniq audit jurnaliga yoziladi.
            </p>
          </div>
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 rounded-[22px] border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/10"
          >
            Sozlamalarga qaytish <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <div className="mb-5 flex flex-wrap gap-2 rounded-[28px] border border-white/10 bg-[#0d111f]/90 p-2">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`inline-flex items-center gap-2 rounded-[20px] px-4 py-2.5 text-sm font-semibold transition ${
              tab === item.id
                ? 'bg-gradient-to-r from-violet-400/20 to-indigo-400/20 text-white'
                : 'text-white/60 hover:bg-white/5 hover:text-white'
            }`}
          >
            <item.icon className="size-4" aria-hidden="true" />
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'overview' ? (
        <div className="space-y-5">
          <AdminStats refreshKey={refreshKey} />

          <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-[28px] border border-white/10 bg-[#09101f]/95 p-6">
              <h2 className="text-lg font-semibold text-white">Tizim Holati</h2>
              <p className="mt-2 text-sm text-white/60">
                Sozlamalar sinxronizatsiyasi va joriy tizim parametrlarini kuzatish.
              </p>
              <div className="mt-5 space-y-3 text-sm">
                <div className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 p-4">
                  <span className="text-white/70">Sinxron holati</span>
                  <span className={`font-semibold ${syncing ? 'text-amber-300' : 'text-emerald-300'}`}>
                    {syncing ? 'Sinxronizatsiya...' : 'Up-to-date'}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 p-4">
                  <span className="text-white/70">Til / Mavzu</span>
                  <span className="font-semibold text-white">{settings.language} · {settings.theme}</span>
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-white/10 bg-[#09101f]/95 p-6">
              <h2 className="text-lg font-semibold text-white">Admin ma'lumotlari</h2>
              <p className="mt-2 text-sm text-white/60">Joriy brauzeringiz uchun saqlangan parametrlar.</p>
              <div className="mt-5 space-y-3 text-sm">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <div className="text-white/50">Valyuta</div>
                  <div className="mt-1 text-white">{settings.currency}</div>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <div className="text-white/50">Vaqt mintaqasi</div>
                  <div className="mt-1 text-white">{settings.timezone}</div>
                </div>
              </div>
            </section>
          </div>
        </div>
      ) : null}

      {tab === 'users' ? <AdminUsers onMutate={bumpRefresh} /> : null}
      {tab === 'transactions' ? <AdminTransactions refreshKey={refreshKey} /> : null}
      {tab === 'audit' ? <AdminAuditLog refreshKey={refreshKey} /> : null}
    </div>
  )
}
