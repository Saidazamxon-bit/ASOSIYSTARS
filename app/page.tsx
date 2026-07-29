'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { StarsSection } from '@/components/stars-section'
import { PremiumSection } from '@/components/premium-section'
import { useTranslation } from '@/lib/languageManager'
import { useAppSettings } from '@/lib/application-settings'
import { AnimatedStar } from '@/components/animated-star'

const TABS = [
  { id: 'stars', labelKey: 'stars.title' },
  { id: 'premium', labelKey: 'premium.title' },
] as const

type Tab = (typeof TABS)[number]['id']

const tabThemes = {
  stars: {
    background: 'linear-gradient(135deg, rgba(255,213,74,0.28), rgba(255,193,7,0.12))',
    glow: '0 0 24px rgba(255,213,74,0.24)',
    border: 'rgba(255,213,74,0.16)',
  },
  premium: {
    background: 'linear-gradient(135deg, rgba(168,85,247,0.28), rgba(139,92,246,0.12))',
    glow: '0 0 24px rgba(168,85,247,0.22)',
    border: 'rgba(168,85,247,0.16)',
  },
}

export default function HomePage() {
  const [tab, setTab] = useState<Tab>('stars')
  const { t } = useTranslation() as any
  const { settings } = useAppSettings()
  const memoizedContent = useMemo(() => {
    return tab === 'stars' ? <StarsSection /> : <PremiumSection />
  }, [tab])

  const reduced = settings.animationMode === 'Off'
  const useMotion = !reduced
  const theme = tabThemes[tab]

  return (
    <div className="flex flex-col gap-4">
      {/* Simple tabs + content: removed hero/animated stars per request */}
      <section className="relative rounded-[28px] border border-white/10 bg-[#0b1020]/90 p-1">
        <div className="relative flex rounded-[26px] bg-[#090b15]/95 p-1">
          {TABS.map((item) => {
            const active = tab === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`relative flex flex-1 items-center justify-center rounded-[24px] px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] transition ${active ? 'text-white' : 'text-white/55'}`}
              >
                {active && (
                  <span
                    className="absolute inset-0 rounded-[24px]"
                    style={{ background: tabThemes[item.id].background, boxShadow: tabThemes[item.id].glow, border: `1px solid ${tabThemes[item.id].border}` }}
                  />
                )}
                <span className="relative z-10">{t(item.labelKey)}</span>
              </button>
            )
          })}
        </div>
      </section>

      <motion.div
        initial={useMotion ? { opacity: 0, y: 12 } : undefined}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, ease: 'easeOut' }}
        className="space-y-5"
      >
        {memoizedContent}
      </motion.div>
    </div>
  )
}
