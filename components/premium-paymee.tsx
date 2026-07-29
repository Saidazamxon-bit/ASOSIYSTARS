'use client'

import { useMemo, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { ChevronDown, Sparkles, Zap, Crown } from 'lucide-react'
import { useAppSettings, formatCurrency } from '@/lib/application-settings'
import { playUIEvent } from '@/lib/sounds'
import { UsernameField } from '@/components/username-field'
import { PurchaseBar } from '@/components/purchase-bar'
import { useBalance } from '@/components/balance-provider'
import { useTranslation } from '@/lib/languageManager'
import { starstgClient } from '@/lib/starstg-client'

const STAR_RATE = 220
const PREMIUM_RATE = 220

const PREMIUM_PACKAGES = [
  { months: 3, usdt: 12 },
  { months: 6, usdt: 16 },
  { months: 12, usdt: 29 },
]

export function PremiumSection() {
  const { settings } = useAppSettings()
  const { balance } = useBalance()
  const { t } = useTranslation() as any
  const [username, setUsername] = useState('')
  const [selected, setSelected] = useState<number | null>(0)
  const [confirmingPremium, setConfirmingPremium] = useState(false)
  const [sentToPremium, setSentToPremium] = useState<string | null>(null)
  const [purchaseError, setPurchaseError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const reduced = useReducedMotion()
  const mode = reduced ? 'Off' : settings.animationMode
  const animationEnabled = mode !== 'Off'

  const total = selected !== null ? PREMIUM_PACKAGES[selected].usdt * PREMIUM_RATE : 0
  const selectedPackage = useMemo(() => {
    if (selected !== null) return `${PREMIUM_PACKAGES[selected].months} months`
    return ''
  }, [selected])

  return (
    <div className="flex flex-col gap-5">
      <motion.section
        initial={animationEnabled ? { opacity: 0, y: 18, scale: 0.98 } : false}
        animate={animationEnabled ? { opacity: 1, y: 0, scale: 1 } : { opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-[30px] border border-white/10 p-4"
        style={{ background: 'linear-gradient(145deg, #160b2e, #2b1a5e 52%, #0f0315)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 24px 65px rgba(0,0,0,0.30)' }}
        aria-label="Telegram Premium"
      >
        <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 16% 18%, rgba(168,85,247,0.24), transparent 26%), radial-gradient(circle at 90% 18%, rgba(255,255,255,0.08), transparent 18%)' }} />
        <div className="relative flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/45">Telegram</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Premium</h2>
            <p className="mt-1 max-w-[16rem] text-sm text-white/60">Ad-free experience and exclusive features</p>
          </div>
          <div className="rounded-full border border-purple-300/30 bg-purple-400/12 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-purple-300">
            Exclusive
          </div>
        </div>

        <div className="relative mt-4 flex items-center gap-4">
          <motion.div
            animate={animationEnabled ? { y: [0, -6, 0], rotate: [0, 4, 0], scale: [1, 1.03, 1] } : undefined}
            transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
            className="relative flex h-24 w-24 items-center justify-center rounded-full border border-white/10 bg-white/6"
          >
            <div className="absolute inset-0 rounded-full border border-purple-400/20" style={{ boxShadow: '0 0 30px rgba(168,85,247,0.16)' }} />
            <Crown className="h-10 w-10 text-purple-300" fill="currentColor" />
          </motion.div>
          <div className="flex-1 rounded-[20px] border border-white/8 bg-black/15 p-3">
            <div className="flex flex-wrap gap-2">
              {['Ad-free', 'Exclusive', 'Premium'].map((item) => (
                <span key={item} className="rounded-full border border-white/10 bg-white/6 px-2.5 py-1 text-[11px] font-medium text-white/65">
                  {item}
                </span>
              ))}
            </div>
            <div className="mt-2 flex items-center gap-2 text-sm text-white/65">
              <Zap className="h-4 w-4 text-purple-300" />
              <span>Premium features for your Telegram experience</span>
            </div>
          </div>
        </div>
      </motion.section>

      <UsernameField value={username} onChange={setUsername} accent="violet" />

      <section aria-label="Premium paketlari">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/45">Duration</h2>
          <span className="text-[11px] text-white/35">{selectedPackage || 'Choose duration'}</span>
        </div>
        <div className="flex flex-col gap-2.5">
          <AnimatePresence initial={false}>
            {PREMIUM_PACKAGES.map((pkg, i) => {
              const active = selected === i
              return (
                <motion.button
                  key={pkg.months}
                  type="button"
                  initial={animationEnabled ? { opacity: 0, y: 10 } : false}
                  animate={animationEnabled ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
                  exit={animationEnabled ? { opacity: 0, y: -8 } : undefined}
                  transition={{ delay: i * 0.03 }}
                  whileHover={animationEnabled ? { y: -3, scale: 1.01 } : undefined}
                  whileTap={animationEnabled ? { scale: 0.98 } : undefined}
                  onClick={() => {
                    setSelected(i)
                    playUIEvent('click')
                  }}
                  className={`relative flex items-center justify-between rounded-[22px] border px-4 py-3.5 text-left ${active ? 'border-purple-400/55 bg-purple-400/10' : 'border-white/10 bg-[#171A23]/90'}`}
                  aria-pressed={active}
                  data-disable-sound="true"
                >
                  <div className="absolute inset-0 rounded-[22px]" style={{ boxShadow: active ? '0 0 0 1px rgba(168,85,247,0.24), 0 0 34px rgba(168,85,247,0.14)' : undefined }} />
                  <div className="relative flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-[16px] ${active ? 'bg-purple-400/20 text-purple-300' : 'bg-white/5 text-white/70'}`}>
                      <Crown className="h-5 w-5" fill="currentColor" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{pkg.months} months</div>
                      <div className="mt-0.5 text-[11px] text-white/45">Telegram Premium</div>
                    </div>
                  </div>
                  <div className="relative text-right">
                    <div className="mt-2 font-mono text-sm font-semibold text-white">${pkg.usdt}</div>
                  </div>
                </motion.button>
              )
            })}
          </AnimatePresence>
        </div>
      </section>

      <PurchaseBar
        label="Premium"
        total={total}
        accent="violet"
        disabled={total <= 0 || username.trim().length < 3}
        productName={selectedPackage}
        action={
          <motion.button
            type="button"
            whileTap={animationEnabled ? { scale: 0.95 } : undefined}
            whileHover={animationEnabled ? { y: -1, boxShadow: '0 16px 40px rgba(168,85,247,0.16)' } : undefined}
            onClick={() => {
              if (!username.trim() || total <= 0) return
              playUIEvent('click')
              setPurchaseError(null)
              setConfirmingPremium(true)
            }}
            className="relative flex min-w-32 items-center justify-center gap-1.5 rounded-[18px] border border-purple-400/40 bg-gradient-to-r from-purple-400 to-purple-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_32px_rgba(168,85,247,0.18)]"
          >
            {t('purchase.buy') || 'Buy'}
          </motion.button>
        }
      />

      {sentToPremium ? (
        <div className="rounded-[20px] border border-emerald-400/20 bg-emerald-400/10 p-3 text-sm font-semibold text-emerald-200">
          {`Sent Premium to ${sentToPremium}`}
        </div>
      ) : null}

      <AnimatePresence>
        {confirmingPremium && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#08090F]/80 px-4 py-6 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-md rounded-[28px] border border-white/10 bg-[#11131A] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)]"
              initial={{ y: 24, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 24, opacity: 0, scale: 0.98 }}
            >
              <div className="flex flex-col gap-4">
                <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4 text-center">
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-white/40">Confirm</p>
                  <p className="mt-3 text-base font-semibold text-white">
                    Send {selectedPackage} Premium for ${PREMIUM_PACKAGES[selected as number]?.usdt}?
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setConfirmingPremium(false)}
                    className="flex-1 rounded-[18px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white/70"
                  >
                    {t('action.cancel') || 'Cancel'}
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={async () => {
                      setSubmitting(true)
                      setPurchaseError(null)
                      try {
                        const months = PREMIUM_PACKAGES[selected as number].months
                        const idempotencyKey = `premium-${username}-${months}-${Date.now()}`
                        const result = await starstgClient.purchasePremium({
                          username: username.trim(),
                          months: months as 3 | 6 | 12,
                          idempotency_key: idempotencyKey,
                        })
                        setSubmitting(false)
                        if (result.success) {
                          playUIEvent('success')
                          setConfirmingPremium(false)
                          setSentToPremium(username.trim())
                          setTimeout(() => setSentToPremium(null), 4000)
                        } else {
                          playUIEvent('insufficient')
                          setPurchaseError(result.error || 'Purchase failed')
                        }
                      } catch (err) {
                        setSubmitting(false)
                        playUIEvent('insufficient')
                        setPurchaseError(String(err).replace('Error: ', ''))
                      }
                    }}
                    className="flex-1 rounded-[18px] border border-white/10 bg-gradient-to-r from-purple-400 to-purple-500 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {submitting ? '...' : `Send to ${username.trim()}`}
                  </button>
                </div>
                {purchaseError ? (
                  <p className="text-center text-xs font-semibold text-red-400">{purchaseError}</p>
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
