'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { ChevronDown, Sparkles, Star, Zap } from 'lucide-react'
import { useAppSettings, formatCurrency } from '@/lib/application-settings'
import { playUIEvent } from '@/lib/sounds'
import { UsernameField } from '@/components/username-field'
import { PurchaseBar } from '@/components/purchase-bar'
import { useBalance } from '@/components/balance-provider'
import { useNotifications } from '@/components/notification-context'
import { useTranslation } from '@/lib/languageManager'
import { starstgClient } from '@/lib/starstg-client'
import { AnimatedStar } from '@/components/animated-star'

const MIN_STARS = 50

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://6a4cc7f182c08.xvest2.ru'

// Fetched catalog state
type StarsPackage = { stars: number; price: number; bonus?: string }

export function StarsSection() {
  const { settings } = useAppSettings()
  const { balance, purchase, openTopUp, user } = useBalance()
  const { addNotification } = useNotifications()
  const { t } = useTranslation() as any
  const [starRate, setStarRate] = useState<number | null>(null)
  const [packages, setPackages] = useState<StarsPackage[]>([])
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [catalogError, setCatalogError] = useState<string | null>(null)
  const [username, setUsername] = useState('')
  const [selected, setSelected] = useState<number | null>(0)
  const [customStars, setCustomStars] = useState('')
  const [expanded, setExpanded] = useState(false)
  const [confirmingStars, setConfirmingStars] = useState(false)
  const [sentToStars, setSentToStars] = useState<string | null>(null)
  const [sentStars, setSentStars] = useState<number | null>(null)
  const [purchaseError, setPurchaseError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const reduced = useReducedMotion()
  const mode = reduced ? 'Off' : settings.animationMode
  const animationEnabled = mode !== 'Off'

  const customCount = Number(customStars || 0)
  const customError = customCount > 0 && customCount < MIN_STARS ? `Minimum ${MIN_STARS} Stars` : null
  const customValid = !customError
  const effectiveStarRate = starRate ?? 220
  const total = customCount > 0 ? customCount * effectiveStarRate : selected !== null && packages[selected] ? packages[selected].price : 0
  const visible = expanded ? packages : packages.slice(0, 2)
  const heroTitle = t('stars.banner.cta') || 'Instant delivery'
  const heroSubtitle = t('stars.banner.sub') || 'Premium digital stars for your next move.'

  const selectedPackage = useMemo(() => {
    if (customCount > 0) return `${customCount} Stars`
    if (selected !== null && packages[selected]) return `${packages[selected].stars} Stars`
    return ''
  }, [customCount, selected])

  useEffect(() => {
    let mounted = true
    setCatalogLoading(true)
    fetch(`${API_BASE}/api/catalog.php`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return
        const rate = Number(data?.starRate) || null
        setStarRate(rate)
        const pkgs: StarsPackage[] = []
        const sp = data?.catalog?.stars_packages || {}
        Object.keys(sp)
          .map((k) => Number(k))
          .sort((a, b) => a - b)
          .forEach((stars) => {
            pkgs.push({ stars, price: sp[String(stars)] })
          })
        setPackages(pkgs)
        setCatalogError(null)
      })
      .catch((err) => {
        setCatalogError(String(err))
      })
      .finally(() => {
        setCatalogLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="flex flex-col gap-5">
      <motion.section
        initial={animationEnabled ? { opacity: 0, y: 18, scale: 0.98 } : false}
        animate={animationEnabled ? { opacity: 1, y: 0, scale: 1 } : { opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-[30px] border border-white/10 p-4"
        style={{ background: 'linear-gradient(145deg, #1f1600, #291b00 52%, #090600)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 24px 65px rgba(0,0,0,0.30)' }}
        aria-label="Telegram Stars"
      >
        <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 16% 18%, rgba(255,213,74,0.24), transparent 26%), radial-gradient(circle at 90% 18%, rgba(255,255,255,0.08), transparent 18%)' }} />
        <div className="relative flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/45">Telegram</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Stars</h2>
            <p className="mt-1 max-w-[16rem] text-sm text-white/60">{heroSubtitle}</p>
          </div>
          <div className="rounded-full border border-[#FFB300]/30 bg-[#FFD54A]/12 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#FFD54A]">
            {heroTitle}
          </div>
        </div>

        <div className="relative mt-4 flex items-center gap-4">
          <AnimatedStar variant="gold" size={128} interactive={false} />
          <div className="flex-1 rounded-[20px] border border-white/8 bg-black/15 p-3">
            <div className="flex flex-wrap gap-2">
              {['Instant', 'Secure', 'Premium'].map((item) => (
                <span key={item} className="rounded-full border border-white/10 bg-white/6 px-2.5 py-1 text-[11px] font-medium text-white/65">
                  {item}
                </span>
              ))}
            </div>
            <div className="mt-2 flex items-center gap-2 text-sm text-white/65">
              <Zap className="h-4 w-4 text-[#FFD54A]" />
              <span>Fast digital delivery with premium feel</span>
            </div>
          </div>
        </div>
      </motion.section>

      <UsernameField value={username} onChange={setUsername} accent="gold" currentUsername={user?.username} />

      <motion.section
        initial={animationEnabled ? { opacity: 0, y: 10 } : false}
        animate={animationEnabled ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
        className="flex items-center gap-3 rounded-[24px] border border-white/10 bg-[#11131A]/90 p-3 shadow-[0_12px_32px_rgba(0,0,0,0.24)]"
        aria-label="Yulduz miqdorini kiriting"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border border-white/10 bg-[#FFD54A]/12 text-[#FFD54A]">
          <Sparkles className="h-5 w-5" />
        </span>
        <div className="relative flex-1">
          <Star className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#FFD54A]" fill="currentColor" aria-hidden="true" />
          <input
            inputMode="numeric"
            value={customStars}
            onChange={(e) => {
              setCustomStars(e.target.value.replace(/\D/g, ''))
              if (e.target.value) setSelected(null)
            }}
            placeholder={t('stars.placeholder.custom') || 'Custom stars'}
            className={`w-full rounded-[16px] border py-3 pl-9 pr-16 text-sm text-white/90 placeholder:text-white/35 outline-none focus:border-[#FFD54A]/50 ${customError ? 'border-red-400/60 bg-[#3a131b]' : 'border-white/10 bg-black/20'}`}
            aria-label="Yulduzlar soni"
            aria-invalid={!!customError}
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-[#FFD54A]">
            Stars
          </span>
        </div>
        {customError ? (
          <p className="mt-2 text-sm font-semibold text-red-400">{customError}</p>
        ) : null}
      </motion.section>

      <section aria-label="Yulduz paketlari">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/45">{t('stars.title') || 'Packages'}</h2>
          <span className="text-[11px] text-white/35">{selectedPackage || 'Choose package'}</span>
        </div>
          <div className="flex flex-col gap-2.5">
          {catalogLoading ? (
            <div className="p-4 text-sm text-white/60">Narxlar yuklanmoqda...</div>
          ) : catalogError ? (
            <div className="p-4 text-sm text-red-400">Xatolik: {catalogError}</div>
          ) : (
            <>
              <AnimatePresence initial={false}>
                {visible.map((pkg, i) => {
                  const active = selected === i && !customStars
                  return (
                    <motion.button
                      key={pkg.stars}
                      type="button"
                      initial={animationEnabled ? { opacity: 0, y: 10 } : false}
                      animate={animationEnabled ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
                      exit={animationEnabled ? { opacity: 0, y: -8 } : undefined}
                      transition={{ delay: i * 0.03 }}
                      whileHover={animationEnabled ? { y: -3, scale: 1.01 } : undefined}
                      whileTap={animationEnabled ? { scale: 0.98 } : undefined}
                      onClick={() => {
                        setSelected(i)
                        setCustomStars('')
                        playUIEvent('click')
                      }}
                      className={`relative flex items-center justify-between rounded-[22px] border px-4 py-3.5 text-left ${active ? 'border-[#FFB300]/55 bg-[#FFD54A]/10' : 'border-white/10 bg-[#171A23]/90'}`}
                      aria-pressed={active}
                      data-disable-sound="true"
                    >
                      <div className="absolute inset-0 rounded-[22px]" style={{ boxShadow: active ? '0 0 0 1px rgba(255,193,7,0.24), 0 0 34px rgba(255,213,74,0.14)' : undefined }} />
                      <div className="relative flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-[16px] ${active ? 'bg-[#FFD54A]/20 text-[#FFD54A]' : 'bg-white/5 text-white/70'}`}>
                          <Star className="h-5 w-5" fill="currentColor" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white">{pkg.stars} Stars</div>
                          <div className="mt-0.5 text-[11px] text-white/45">{pkg.bonus || ''}</div>
                        </div>
                      </div>
                      <div className="relative text-right">
                        <div className="mt-2 font-mono text-sm font-semibold text-white">{formatCurrency(pkg.price, settings.currency)}</div>
                      </div>
                    </motion.button>
                  )
                })}
              </AnimatePresence>

              <motion.button
                type="button"
                whileTap={animationEnabled ? { scale: 0.98 } : undefined}
                onClick={() => setExpanded((e) => !e)}
                className="flex items-center justify-center gap-1.5 rounded-[20px] border border-white/10 bg-white/[0.04] py-3 text-xs font-semibold uppercase tracking-[0.24em] text-white/65"
                aria-expanded={expanded}
              >
                {expanded ? 'Show less' : 'Show more'}
                <motion.span animate={animationEnabled ? { rotate: expanded ? 180 : 0 } : { rotate: 0 }}>
                  <ChevronDown className="size-4" aria-hidden="true" />
                </motion.span>
              </motion.button>
            </>
          )}
        </div>
      </section>

      <PurchaseBar
        label="Stars"
        total={total}
        accent="gold"
        disabled={total <= 0 || username.trim().length < 3 || !customValid}
        productName={selectedPackage}
        action={
          <motion.button
            type="button"
            whileTap={animationEnabled ? { scale: 0.95 } : undefined}
            whileHover={animationEnabled ? { y: -1, boxShadow: '0 16px 40px rgba(255,213,74,0.16)' } : undefined}
            onClick={() => {
              if (!username.trim() || total <= 0 || !customValid) {
                if (customError) {
                  setPurchaseError(customError)
                }
                return
              }
              if (balance < total) {
                setPurchaseError('USD balans yetarlik emas. BALANSDA muammo — admin bilan bog‘laning.')
                playUIEvent('insufficient')
                addNotification(
                  'Balans yetarli emas',
                  'Stars sotib olish uchun balansingizni to‘ldiring.',
                  { emoji: '⚠️', color: '#ef4444' }
                )
                return
              }
              playUIEvent('click')
              setPurchaseError(null)
              setConfirmingStars(true)
            }}
            className="relative flex min-w-32 items-center justify-center gap-1.5 rounded-[18px] border border-[#FFB300]/40 bg-gradient-to-r from-[#FFD54A] to-[#FFB300] px-4 py-2.5 text-sm font-semibold text-[#1F1A05] shadow-[0_10px_32px_rgba(255,213,74,0.18)]"
          >
            {t('purchase.buy') || 'Buy'}
          </motion.button>
        }
      />
      {purchaseError ? (
        <div className="mt-3 rounded-[20px] border border-red-400/20 bg-red-400/10 p-3 text-sm font-semibold text-red-200">
          {purchaseError}
        </div>
      ) : null}

      {sentToStars && sentStars ? (
        <div className="rounded-[20px] border border-emerald-400/20 bg-emerald-400/10 p-3 text-sm font-semibold text-emerald-200">
          {`Sent ${sentStars} Stars to ${sentToStars}`}
        </div>
      ) : null}

      <AnimatePresence>
        {confirmingStars && (
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
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-white/40">{t('purchase.confirmTitle') || 'Confirm'}</p>
                  <p className="mt-3 text-base font-semibold text-white">
                    {t('purchase.confirmBody', {
                      name: selectedPackage,
                      amount: formatCurrency(total, settings.currency),
                    }) || `Send ${selectedPackage} for ${formatCurrency(total, settings.currency)}`}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setConfirmingStars(false)}
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
                        const starsToSend = customCount > 0 ? customCount : selected !== null ? packages[selected]?.stars ?? 0 : 0
                        const idempotencyKey = `stars-${username}-${starsToSend}-${Date.now()}`
                        const result = await starstgClient.purchaseStars({
                          username: username.trim(),
                          stars: starsToSend,
                          idempotency_key: idempotencyKey,
                        })
                        setSubmitting(false)
                        if (result.success) {
                          playUIEvent('success')
                          setConfirmingStars(false)
                          setSentToStars(username.trim())
                          setSentStars(starsToSend)
                          setTimeout(() => {
                            setSentToStars(null)
                            setSentStars(null)
                          }, 4000)
                        } else {
                          playUIEvent('insufficient')
                          const errorText = result.error?.toLowerCase().includes('balan') || result.error?.toLowerCase().includes('insufficient')
                            ? 'USD balans yetarlik emas. BALANSDA muammo — admin bilan bog‘laning.'
                            : result.error || 'Purchase failed'
                          setPurchaseError(errorText)
                        }
                      } catch (err) {
                        setSubmitting(false)
                        playUIEvent('insufficient')
                        const message = String(err).replace('Error: ', '')
                        setPurchaseError(
                          message.toLowerCase().includes('balan') || message.toLowerCase().includes('insufficient')
                            ? 'USD balans yetarlik emas. BALANSDA muammo — admin bilan bog‘laning.'
                            : message,
                        )
                      }
                    }}
                    className="flex-1 rounded-[18px] border border-white/10 bg-gradient-to-r from-[#FFD54A] to-[#FFB300] px-4 py-3 text-sm font-semibold text-[#1F1A05] disabled:opacity-50"
                  >
                    {submitting ? '...' : (t('purchase.confirmSend', { name: username.trim() }) || `Send to ${username.trim()}`)}
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
