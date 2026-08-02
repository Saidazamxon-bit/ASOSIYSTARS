'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  Clock3,
  Crown,
  HelpCircle,
  Settings,
  Sparkles,
  Star,
  TrendingUp,
  Trophy,
  User,
  Users,
  Zap,
} from 'lucide-react'
import { useBalance, formatUZS } from '@/components/balance-provider'
import { useTranslation } from '@/lib/languageManager'

const menuItems = [
  { href: '/rating', label: 'Top 10 reyting', icon: Trophy },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: 'https://t.me/saidazaam', label: 'Help', icon: HelpCircle },
]

export default function ProfilePage() {
  const { t } = useTranslation() as any
  const { history, balance, user, authError, loading } = useBalance()
  const [telegramUser, setTelegramUser] = useState<Record<string, any> | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const tg = (window as any).Telegram?.WebApp
    if (tg?.initDataUnsafe?.user) {
      setTelegramUser(tg.initDataUnsafe.user)
    }
  }, [])

  const profileUser = telegramUser ?? user

  const displayName = profileUser?.first_name || profileUser?.last_name
    ? [profileUser?.first_name, profileUser?.last_name].filter(Boolean).join(' ')
    : profileUser?.displayName || profileUser?.username || t('profile.user') || 'Foydalanuvchi'

  const profileLabel = profileUser?.username ? `@${profileUser.username}` : ''
  const profileId = profileUser?.id ?? profileUser?.telegramId
  const photoUrl = profileUser?.photo_url || profileUser?.avatarUrl
  const initials = profileUser?.first_name || profileUser?.last_name
    ? `${profileUser?.first_name?.[0] ?? ''}${profileUser?.last_name?.[0] ?? ''}`.toUpperCase()
    : profileUser?.username?.slice(0, 2).toUpperCase() || 'U'
  const isPremium = Boolean(profileUser?.is_premium ?? profileUser?.premiumStatus)
  const levelText = `Level ${profileUser?.vipLevel ?? 0}`

  if (authError) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-[#08090F] px-3 py-6">
        <div className="rounded-3xl border border-rose-400/25 bg-rose-500/10 p-6 text-center text-white">
          <h1 className="mb-3 text-xl font-semibold">Xatolik yuz berdi</h1>
          <p className="text-sm text-rose-100/90">Iltimos, ilovani Telegram ichida oching va qayta urinib ko'ring.</p>
          <p className="mt-4 text-xs text-white/60">{authError ? String(authError) : ''}</p>
        </div>
      </div>
    )
  }

  if (loading && !user) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-[#08090F] px-3 py-6">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center text-white/80">
          <p>Yuklanmoqda...</p>
        </div>
      </div>
    )
  }

  // DIQQAT: profileUser EMAS — profileUser haqiqiy Telegramda ochilganda
  // Telegram SDK obyekti bo'lib qoladi (undan totalDeposited/totalStars/
  // referralCount kelmaydi). Bu maydonlar faqat backenddan kelgan `user`da bor.
  const totalDeposited = Number(user?.totalDeposited ?? 0)
  const totalStars = Number(user?.totalStars ?? 0)
  const referralCount = Number(user?.referralCount ?? 0)

  const stats = [
    { label: 'Soliingan balans', value: formatUZS(totalDeposited), icon: TrendingUp },
    { label: 'Soliingan Stars', value: `${totalStars}`, icon: Star },
    { label: 'Referal', value: `${referralCount}`, icon: Users },
  ]

  const renderText = (key: string, fallback: string) => {
    const value = t(key)
    return typeof value === 'string' && value !== key ? value : fallback
  }

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
          <div className="absolute inset-0 opacity-[0.16]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
        </div>

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -3, scale: 1.02 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="group relative mb-5 overflow-hidden rounded-[26px] border border-white/10 bg-[#080a14]/95 p-6 shadow-[0_40px_100px_rgba(0,0,0,0.45)] backdrop-blur-[20px]"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(56,189,248,0.08),transparent_32%),linear-gradient(180deg,rgba(8,9,14,0.96),rgba(4,7,18,0.98))]" />
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(255,255,255,0.08),transparent_36%)]" />
            <span className="absolute left-1/2 top-8 h-32 w-32 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
            <span className="absolute right-6 top-20 h-24 w-24 rounded-full bg-blue-400/5 blur-3xl" />
            <span className="absolute left-10 bottom-10 h-20 w-20 rounded-full bg-sky-400/5 blur-3xl" />
          </div>

          <div className="relative flex flex-col items-center text-center">
            <div className="relative mb-5 flex h-[140px] w-[140px] items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-cyan-300/30 blur-sm spinSlow" />
              <div className="absolute inset-0 rounded-full bg-cyan-400/15 blur-2xl pulseSlow" />
              <span className="particle particle-1" />
              <span className="particle particle-2" />
              <span className="particle particle-3" />
              <span className="orbiter orbiter-1" />
              <span className="orbiter orbiter-2" />
              <span className="orbiter orbiter-3" />
              <div className="relative z-20 flex h-[100px] w-[100px] items-center justify-center overflow-hidden rounded-full border border-white/10 bg-slate-950 shadow-[0_0_50px_rgba(56,189,248,0.18)] breathe">
                {photoUrl ? (
                  <img src={photoUrl} alt={displayName} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 text-2xl font-semibold uppercase tracking-[0.16em] text-cyan-100">
                    {initials}
                  </div>
                )}
              </div>
              <span className="absolute inset-0 rounded-full border border-cyan-300/20 opacity-50" />
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-semibold text-white">{displayName}</h1>
              <p className="text-sm text-cyan-100/80">{profileLabel || 'No username'}</p>
              <p className="text-xs uppercase tracking-[0.3em] text-white/40">ID {profileId ?? '---'}</p>
            </div>

            <div className="mt-6" />

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <div className="pill-level">{levelText}</div>
              <div className="status-badge">
                <span className="status-dot" /> 🟢 Online
              </div>
            </div>
          </div>

        </motion.section>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.45 }}
          className="mb-5 grid grid-cols-3 gap-3"
        >
          {stats.map((item, index) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.label}
                whileHover={{ y: -4, scale: 1.02, boxShadow: '0 12px 30px rgba(0,0,0,0.32)' }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                className="rounded-[22px] border border-white/10 p-3"
                style={{
                  background: 'linear-gradient(145deg, rgba(23,26,35,0.9), rgba(17,19,26,0.95))',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
                }}
              >
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-[var(--accent)]">
                  <Icon className="h-4 w-4" />
                </div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">{item.label}</p>
                <p className="mt-1 text-xl font-semibold text-white">{item.value}</p>
              </motion.div>
            )
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16, duration: 0.45 }}
          className="space-y-2"
        >
          {menuItems.map((item, index) => {
            const Icon = item.icon
            return (
              <Link key={item.label} href={item.href} className="block">
                <motion.div
                  whileHover={{ y: -3, scale: 1.01, boxShadow: '0 16px 38px rgba(0,0,0,0.28)' }}
                  whileTap={{ scale: 0.98 }}
                  className="group flex items-center gap-3 rounded-[22px] border border-white/10 p-3"
                  style={{ background: 'linear-gradient(145deg, rgba(23,26,35,0.92), rgba(17,19,26,0.94))' }}
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/6 text-[var(--accent)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="flex-1 text-sm font-medium text-white">{item.label}</span>
                  <motion.span
                    animate={{ x: [0, 3, 0] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                    className="text-white/45 transition-transform group-hover:text-[var(--accent)]"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </motion.span>
                </motion.div>
              </Link>
            )
          })}
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.45 }}
          className="mt-5 rounded-[26px] border border-white/10 p-4"
          style={{ background: 'linear-gradient(145deg, rgba(17,19,26,0.96), rgba(11,13,18,0.96))' }}
        >
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">{renderText('profile.monitoring.title', 'Monitoring')}</h3>
              <p className="text-[11px] uppercase tracking-[0.26em] text-white/45">{renderText('profile.monitoring.label', 'Recent activity')}</p>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-[var(--accent)]">
              Live
            </div>
          </div>

          {history.length === 0 ? (
            <div className="rounded-[22px] border border-dashed border-white/10 bg-black/20 p-4 text-sm text-white/55">
              {renderText('profile.monitoring.empty', 'No transactions yet')}
            </div>
          ) : (
            <div className="space-y-3">
              {history.slice(0, 4).map((entry: any) => {
                const iconMap: Record<string, any> = {
                  topup: TrendingUp,
                  stars: Star,
                  premium: Crown,
                  default: Activity,
                }
                const Icon = iconMap[entry.type] ?? iconMap.default
                return (
                  <motion.div
                    key={entry.id}
                    whileHover={{ y: -2, scale: 1.01 }}
                    className="rounded-[20px] border border-white/10 bg-white/[0.04] p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-[var(--accent)]">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.24em] text-white/45">
                            {entry.type}
                          </p>
                          <p className="mt-1 text-sm font-semibold text-white">{entry.product}</p>
                          {entry.recipient ? (
                            <p className="mt-1 text-xs text-white/45">{entry.recipient}</p>
                          ) : null}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-white">{formatUZS(entry.amount)}</p>
                        <div className="mt-1 flex items-center gap-1 text-[11px] text-white/45">
                          <Clock3 className="h-3.5 w-3.5" />
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.section>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.32, duration: 0.45 }}
          className="mt-8 text-center"
        >
          <p className="text-[11px] uppercase tracking-[0.3em] text-white/35">ULTRA v1.0.0</p>
          <p className="mt-1 text-xs text-white/30">Built for a premium mobile feel</p>
        </motion.div>
      </main>
    </div>
  )
}
