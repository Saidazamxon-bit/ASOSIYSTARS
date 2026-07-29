'use client'

import { useState, memo, type ReactNode } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Check, AlertCircle, Sparkles } from 'lucide-react'
import { useBalance } from '@/components/balance-provider'
import { useTranslation } from '@/lib/languageManager'
import { useAppSettings, formatCurrency } from '@/lib/application-settings'
import { playUIEvent } from '@/lib/sounds'

type PurchaseBarProps = {
  label: string
  total: number
  accent: 'gold' | 'violet'
  disabled?: boolean
  productName?: string
  action?: ReactNode
}

const accentTheme = {
  gold: {
    glow: 'rgba(255,213,74,0.26)',
    panel: 'linear-gradient(180deg, rgba(255,213,74,0.08), rgba(255,213,74,0.02))',
    button: 'linear-gradient(135deg, #FFD54A, #FFB300)',
    buttonText: '#1F1A05',
    border: '#FFB300',
  },
  violet: {
    glow: 'rgba(139,92,246,0.24)',
    panel: 'linear-gradient(180deg, rgba(139,92,246,0.14), rgba(139,92,246,0.04))',
    button: 'linear-gradient(135deg, #8B5CF6, #A855F7)',
    buttonText: '#FFFFFF',
    border: '#7C3AED',
  },
}

function PurchaseBarComponent({ label, total, accent, disabled, productName, action }: PurchaseBarProps) {
  const { balance, openTopUp } = useBalance()
  const { settings } = useAppSettings()
  const { t } = useTranslation() as any
  const [status, setStatus] = useState<'idle' | 'success' | 'insufficient'>('idle')
  const reduced = useReducedMotion()
  const mode = reduced ? 'Off' : settings.animationMode
  const useMotion = mode !== 'Off'
  const theme = accentTheme[accent]

  function handleBuy() {
    // Eslatma: bu komponent stars-section.tsx va premium-section.tsx da
    // har doim `action` prop bilan ustiga yoziladi, shuning uchun bu
    // default xarid tugmasi amalda ishlatilmaydi.
    if (disabled || total <= 0) return
    playUIEvent('click')
    if (balance < total) {
      playUIEvent('insufficient')
      setStatus('insufficient')
      setTimeout(() => {
        setStatus('idle')
        openTopUp()
      }, 1200)
      return
    }
    playUIEvent('success')
    setStatus('success')
    setTimeout(() => setStatus('idle'), 2200)
  }

  return (
    <motion.section
      initial={useMotion ? { opacity: 0, y: 16 } : false}
      animate={useMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-[28px] border bg-[#11131A]/95 p-3.5 shadow-[0_16px_50px_rgba(0,0,0,0.28)]"
      style={{ borderColor: theme.border, backgroundImage: theme.panel, boxShadow: `0 0 0 1px ${theme.border}10, 0 24px 70px rgba(0,0,0,0.28)` }}
      aria-label="Xarid paneli"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-[18px] border border-white/10 bg-white/5" style={{ boxShadow: `0 0 24px ${theme.glow}` }}>
            <Sparkles className="h-5 w-5" style={{ color: accent === 'gold' ? '#FFB300' : '#E9D5FF' }} />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/45">{label}</p>
            <motion.span
              key={total}
              initial={useMotion ? { opacity: 0, y: 4 } : false}
              animate={useMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
              className="font-mono text-base font-semibold text-white"
            >
              {formatCurrency(total, settings.currency)}
            </motion.span>
          </div>
        </div>

        {action ? (
          action
        ) : (
          <motion.button
            type="button"
            whileTap={useMotion ? { scale: 0.95 } : undefined}
            whileHover={useMotion ? { y: -1, boxShadow: `0 18px 40px ${theme.glow}` } : undefined}
            onClick={handleBuy}
            data-disable-sound="true"
            disabled={disabled}
            className="relative flex min-w-[145px] items-center justify-center gap-2 rounded-[20px] px-5 py-3 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-45"
            style={{
              backgroundImage: theme.button,
              color: theme.buttonText,
              border: `1px solid ${theme.border}`,
              boxShadow: useMotion ? `0 18px 40px ${theme.glow}` : undefined,
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {status === 'success' ? (
                <motion.span
                  key="ok"
                  initial={useMotion ? { scale: 0.8, opacity: 0 } : false}
                  animate={useMotion ? { scale: 1, opacity: 1 } : { scale: 1, opacity: 1 }}
                  exit={useMotion ? { scale: 0.8, opacity: 0 } : undefined}
                  className="flex items-center gap-1.5"
                >
                  <Check className="size-4" strokeWidth={3} aria-hidden="true" />
                  {productName ? t('purchase.send') : t('purchase.done')}
                </motion.span>
              ) : status === 'insufficient' ? (
                <motion.span
                  key="no"
                  initial={useMotion ? { x: -4, opacity: 0 } : false}
                  animate={useMotion ? { x: [0, -5, 5, -3, 3, 0], opacity: 1 } : { opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="flex items-center gap-1.5"
                >
                  <AlertCircle className="size-4" aria-hidden="true" />
                  {t('purchase.insufficient')}
                </motion.span>
              ) : (
                <motion.span
                  key="buy"
                  initial={useMotion ? { opacity: 0 } : false}
                  animate={useMotion ? { opacity: 1 } : { opacity: 1 }}
                  exit={useMotion ? { opacity: 0 } : undefined}
                >
                  {t('purchase.buy')}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        )}
      </div>
    </motion.section>
  )
}

export const PurchaseBar = memo(PurchaseBarComponent)
