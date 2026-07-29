'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Gift } from 'lucide-react'
import { useTranslation } from '@/lib/languageManager'
import { NftGifts } from '@/components/nft-gifts'
import { RegularGifts } from '@/components/regular-gifts'

const TABS = [
  { id: 'nft', labelKey: 'market.tab.nft', icon: Sparkles },
  { id: 'regular', labelKey: 'market.tab.regular', icon: Gift },
] as const

type Tab = (typeof TABS)[number]['id']

export default function MarketPage() {
  const [tab, setTab] = useState<Tab>('nft')
  const { t } = useTranslation() as any

  return (
    <div className="flex flex-col gap-5">
      <section className="relative rounded-[28px] border border-white/10 bg-[#11131a]/95 p-1.5">
        <div className="relative flex gap-2 rounded-[26px] bg-[#090b15]/95 p-1">
          {TABS.map((item) => {
            const active = tab === item.id
            const Icon = item.icon
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(item.id)}
                className="relative flex flex-1 items-center justify-center gap-2 rounded-[22px] px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white/70 transition"
              >
                {active && (
                  <span className="absolute inset-0 rounded-[22px] bg-gradient-to-r from-violet-500/20 to-indigo-500/20 shadow-[0_0_40px_rgba(139,92,246,0.16)]" />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Icon className="size-4" aria-hidden="true" />
                  {t(item.labelKey)}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.98 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          className="space-y-5"
        >
          {tab === 'nft' ? <NftGifts /> : <RegularGifts />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
