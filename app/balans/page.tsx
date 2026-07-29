'use client'

import { motion } from 'framer-motion'
import { Wallet, Plus, ShieldCheck, Zap } from 'lucide-react'
import { NumberTicker } from '@/registry/magicui/number-ticker'
import { useBalance, formatUZS } from '@/components/balance-provider'
import { useTranslation } from '@/lib/languageManager'

const FEATURES = [
  { icon: Zap, id: 'fast', title: 'Tezkor', text: "To'lov bir zumda hisobingizga tushadi" },
  { icon: ShieldCheck, id: 'secure', title: 'Xavfsiz', text: 'Har bir tranzaksiya himoyalangan' },
]

export default function BalansPage() {
  const { balance, balanceLoaded, openTopUp } = useBalance()
  const { t } = useTranslation() as any

  return (
    <div className="flex flex-col gap-5">
      {/* Balance card (restored animated/shimmer style) */}
      <motion.section
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="shimmer relative overflow-hidden rounded-3xl border border-gold/30 bg-gradient-to-br from-violet-brand/35 via-secondary/70 to-gold/15 p-6 glow-gold"
        aria-label={t('balance.current')}
      >
        <div className="flex items-center gap-2 text-muted-foreground">
          <Wallet className="size-4 text-success" aria-hidden="true" />
          <span className="text-[11px] font-bold uppercase tracking-[0.25em]">{t('balance.current')}</span>
        </div>
        <p className="mt-3 font-mono text-6xl font-bold tracking-tight text-foreground">
          <NumberTicker
            value={balance}
            formatter={formatUZS}
            className="text-6xl font-mono font-bold tracking-tight"
          />{' '}
          <span className="text-lg text-muted-foreground">UZS</span>
        </p>
          <motion.button
          type="button"
          whileTap={{ scale: 0.96 }}
          onClick={openTopUp}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gold py-3.5 text-sm font-bold text-gold-foreground"
        >
          <Plus className="size-4" strokeWidth={3} aria-hidden="true" />
          {t('balance.topup')}
        </motion.button>
      </motion.section>

      {/* Features */}
      <section className="flex flex-col gap-3" aria-label={t('balance.features.title')}>
        {FEATURES.map((f, i) => {
          const Icon = f.icon
          return (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.07 }}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-violet-brand/25">
                <Icon className="size-5 text-accent-foreground" aria-hidden="true" />
              </span>
              <span className="flex flex-col">
                      <span className="text-sm font-bold text-foreground">{t(`feature.${f.id}`) || f.title}</span>
                      <span className="text-xs text-muted-foreground text-pretty">{t(`feature.${f.id}.desc`) || f.text}</span>
              </span>
            </motion.div>
          )
        })}
      </section>
    </div>
  )
}
