'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Crown, Zap } from 'lucide-react'
import { useAppSettings, formatCurrency } from '@/lib/application-settings'
import { useBalance } from '@/components/balance-provider'
import { useNotifications } from '@/components/notification-context'
import { playUIEvent, playTushdiSound } from '@/lib/sounds'
import { UsernameField } from '@/components/username-field'
import { PurchaseBar } from '@/components/purchase-bar'
import { useTranslation } from '@/lib/languageManager'
import { starstgClient, pollStarstgOrderStatus } from '@/lib/starstg-client'
import { AnimatedStar } from '@/components/animated-star'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://6a4cc7f182c08.xvest2.ru'

// "Akkountga kirib" (login orqali) paketlar — buy bosilganda to'g'ridan-to'g'ri
// @saidazaam ga tayyor matn bilan yo'naltiriladi, oddiy balans/xarid oqimi ishlamaydi.
const TELEGRAM_LOGIN_CONTACT = 'saidazaam'

type PremiumPlan = { key: string; name: string; price: number; months: 1 | 3 | 6 | 12 }

function isLoginPlan(p: PremiumPlan) {
  return p.key === 'login-1m' || p.key === 'login-12m' || p.key === '1m' || p.key === '12a' || /kirib/i.test(p.name)
}

function formatSom(amount: number) {
  return `${String(Math.round(amount)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} so'm`
}

function buildLoginContactLink(months: number, price: number) {
  const text = `Assalomu alaykum! 😊\n🌟 Sizlardan ${months} oylik Telegram Premium xarid qilmoqchi edim.\n💰 Sizlarda narxi ${formatSom(price)} ekan`
  return `https://t.me/${TELEGRAM_LOGIN_CONTACT}?text=${encodeURIComponent(text)}`
}

// "Akkountga kirib" paketlar — bazadan/admin paneldan olinmaydi, narxi va joyi
// shu yerda qattiq belgilangan. O'zgartirish kerak bo'lsa faqat shu 2 qatorni tahrirlang.
const LOGIN_ONE_MONTH: PremiumPlan = { key: 'login-1m', name: 'Akkountga kirib 1 oy', price: 45000, months: 1 }
const LOGIN_TWELVE_MONTH: PremiumPlan = { key: 'login-12m', name: 'Akkountga kirib 12 oy', price: 290000, months: 12 }

export function PremiumSection() {
  const { settings } = useAppSettings()
  const { t } = useTranslation() as any
  const { user, balance, purchase, refresh } = useBalance()
  const { addNotification } = useNotifications()
  const [username, setUsername] = useState('')
  const [plans, setPlans] = useState<PremiumPlan[]>([])
  const [plansLoading, setPlansLoading] = useState(true)
  const [plansError, setPlansError] = useState<string | null>(null)
  const [selected, setSelected] = useState(0)
  const [confirmingPremium, setConfirmingPremium] = useState(false)
  const [sentToPremium, setSentToPremium] = useState<string | null>(null)
  const [purchaseError, setPurchaseError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [foundUser, setFoundUser] = useState<{ name: string; photo?: string; recipient: string } | null>(null)
  const [checkingUser, setCheckingUser] = useState(false)
  const reduced = useReducedMotion()
  const mode = reduced ? 'Off' : settings.animationMode
  const animationEnabled = mode !== 'Off'

  const plan = plans[selected]
  const total = plan ? plan.price : 0

  useEffect(() => {
    let mounted = true
    setPlansLoading(true)
    fetch(`${API_BASE}/api/catalog.php`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return
        const pp = data?.catalog?.premium_plans || {}
        const list: PremiumPlan[] = Object.keys(pp).map((k) => {
          const parsedMonths = parseInt(k, 10)
          const months = (
            parsedMonths === 1 || parsedMonths === 3 || parsedMonths === 6 || parsedMonths === 12 ? parsedMonths : 12
          ) as 1 | 3 | 6 | 12
          return { key: k, name: pp[k].name, price: pp[k].price, months }
        })
        // Faqat "Hadya orqali" paketlar bazadan/admin paneldan keladi va oy soniga
        // qarab tartiblanadi. "Akkountga kirib" ikkalasi bazadagi har qanday mos
        // yozuvni almashtirib, doim qattiq belgilangan holda 1 oylik eng tepada,
        // 12 oylik eng pastda turadi.
        const gifts = list.filter((p) => !isLoginPlan(p)).sort((a, b) => a.months - b.months)
        setPlans([LOGIN_ONE_MONTH, ...gifts, LOGIN_TWELVE_MONTH])
        setPlansError(null)
      })
      .catch((err) => {
        if (!mounted) return
        // Baza/admin panel bilan bog'lanib bo'lmasa ham, login paketlar doim ko'rinadi.
        setPlans([LOGIN_ONE_MONTH, LOGIN_TWELVE_MONTH])
        setPlansError(String(err))
      })
      .finally(() => {
        if (mounted) setPlansLoading(false)
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
          <AnimatedStar variant="premium" size={128} interactive={false} />
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

      <UsernameField value={username} onChange={setUsername} accent="violet" currentUsername={user?.username} />

      <section aria-label="Premium paketlari">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/45">Duration</h2>
          <span className="text-[11px] text-white/35">{plan ? plan.name : '-'}</span>
        </div>
        <div className="flex flex-col gap-2.5">
          {plansLoading ? (
            <div className="p-4 text-sm text-white/60">Narxlar yuklanmoqda...</div>
          ) : (
            <AnimatePresence initial={false}>
              {plansError ? (
                <div className="mb-1 rounded-[16px] border border-red-400/20 bg-red-400/10 p-3 text-xs text-red-300">
                  Hadya orqali paketlarni yuklab bo'lmadi, Akkountga kirib paketlar ko'rsatilmoqda.
                </div>
              ) : null}
              {plans.map((pkg, i) => {
                const active = selected === i
                return (
                  <motion.button
                    key={pkg.key}
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
                        {isLoginPlan(pkg) ? (
                          <span className="mb-1 inline-block rounded-full bg-gradient-to-r from-fuchsia-500 to-purple-500 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                            Akkountga kirib
                          </span>
                        ) : (
                          <span className="mb-1 inline-block rounded-full border border-emerald-400/30 bg-emerald-400/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-300">
                            Hadya orqali
                          </span>
                        )}
                        <div className="text-sm font-semibold text-white">{pkg.name}</div>
                        <div className="mt-0.5 text-[11px] text-white/45">Telegram Premium</div>
                      </div>
                    </div>
                    <div className="relative text-right">
                      <div className="mt-2 font-mono text-sm font-semibold text-white">{formatCurrency(pkg.price, settings.currency)}</div>
                    </div>
                  </motion.button>
                )
              })}
            </AnimatePresence>
          )}
        </div>
      </section>

      <PurchaseBar
        label="Premium"
        total={total}
        accent="violet"
        disabled={!plan || (isLoginPlan(plan) ? false : total <= 0 || username.trim().length < 3)}
        productName={plan ? `${plan.months} months` : ''}
        action={
          <motion.button
            type="button"
            whileTap={animationEnabled ? { scale: 0.95 } : undefined}
            whileHover={animationEnabled ? { y: -1, boxShadow: '0 16px 40px rgba(168,85,247,0.16)' } : undefined}
            onClick={async () => {
              if (!plan) return
              if (isLoginPlan(plan)) {
                playUIEvent('click')
                window.open(buildLoginContactLink(plan.months, plan.price), '_blank')
                return
              }
              if (!username.trim() || total <= 0) return
              if (balance < total) {
                setPurchaseError('USD balans yetarlik emas. BALANSDA muammo — admin bilan bog‘laning.')
                playUIEvent('insufficient')
                addNotification(
                  'Balans yetarli emas',
                  'Premium sotib olish uchun balansingizni to‘ldiring.',
                  { emoji: '⚠️', color: '#ef4444' }
                )
                return
              }
              playUIEvent('click')
              setPurchaseError(null)
              setFoundUser(null)
              setCheckingUser(true)
              try {
                const res = await starstgClient.search('premium', username.trim(), undefined, plan.months)
                if (res.success && res.found) {
                  setFoundUser({ name: res.found.name, photo: res.found.photo, recipient: res.found.recipient })
                } else {
                  setPurchaseError('Foydalanuvchi topilmadi. Username to‘g‘riligini tekshiring.')
                  setCheckingUser(false)
                  return
                }
              } catch (err) {
                setPurchaseError('Foydalanuvchini aniqlashda xatolik. Username to‘g‘riligini tekshiring.')
                setCheckingUser(false)
                return
              }
              setCheckingUser(false)
              setConfirmingPremium(true)
            }}
            className="relative flex min-w-32 items-center justify-center gap-1.5 rounded-[18px] border border-purple-400/40 bg-gradient-to-r from-purple-400 to-purple-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_32px_rgba(168,85,247,0.18)] disabled:opacity-60"
            disabled={checkingUser}
          >
            {checkingUser ? '...' : (t('purchase.buy') || 'Buy')}
          </motion.button>
        }
      />

      {sentToPremium ? (
        <div className="rounded-[20px] border border-emerald-400/20 bg-emerald-400/10 p-3 text-sm font-semibold text-emerald-200">
          {`✅ ${plan?.months} oylik Premium — @${sentToPremium} akkauntiga tashlab berildi`}
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
                {foundUser ? (
                  <div className="flex flex-col items-center gap-2 rounded-[22px] border border-white/10 bg-white/[0.04] p-4 text-center">
                    <div className="h-16 w-16 overflow-hidden rounded-full border border-purple-400/40 bg-black/30">
                      {foundUser.photo ? (
                        <img src={foundUser.photo} alt={foundUser.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-white/60">
                          {foundUser.name?.[0]?.toUpperCase() || '?'}
                        </div>
                      )}
                    </div>
                    <p className="text-base font-semibold text-white">{foundUser.name}</p>
                    <p className="text-xs text-white/50">@{foundUser.recipient}</p>
                    <p className="mt-1 text-xs font-semibold text-purple-300">Shu odamgami?</p>
                  </div>
                ) : null}
                <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4 text-center">
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-white/40">Confirm</p>
                  <p className="mt-3 text-base font-semibold text-white">
                    Send {plan?.months} months Premium for {formatCurrency(plan?.price ?? 0, settings.currency)}?
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmingPremium(false)
                      setFoundUser(null)
                    }}
                    className="flex-1 rounded-[18px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white/70"
                  >
                    {t('action.cancel') || 'Cancel'}
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={async () => {
                      if (!plan) return
                      setSubmitting(true)
                      setPurchaseError(null)
                      const targetUsername = username.trim()
                      const months = plan.months

                      // 1) Bizning tizimimizda buyurtma ochamiz — balans darhol
                      // yechiladi va buyurtma "pending" holatda qayd etiladi.
                      const order = await purchase({
                        category: 'premium',
                        productKey: plan.key,
                        targetUsername,
                        amount: plan.price,
                        productName: plan.name,
                      })

                      if (!order.success || !order.orderId) {
                        setSubmitting(false)
                        playUIEvent('insufficient')
                        setPurchaseError(order.error || 'Buyurtma ochilmadi')
                        return
                      }

                      // 2) StarsTG'dan haqiqiy yetkazishni so'raymiz.
                      let finalStatus: 'completed' | 'failed' = 'failed'
                      let failReason = ''
                      try {
                        const idempotencyKey = `order-${order.orderId}`
                        const result = await starstgClient.purchasePremium({
                          username: targetUsername,
                          months,
                          idempotency_key: idempotencyKey,
                        })
                        if (result.success && result.status === 'completed') {
                          finalStatus = 'completed'
                        } else if (result.success && result.status === 'processing') {
                          finalStatus = await pollStarstgOrderStatus(result.order_id)
                        } else {
                          failReason = result.error || 'StarsTG xatolik qaytardi'
                        }
                      } catch (err) {
                        failReason = String(err).replace('Error: ', '')
                      }

                      // 3) Yakuniy holatni backendga qaytaramiz — "fulfilled" bo'lsa
                      // pul balансda qoladi va "tushdi" xabari ketadi, "failed"
                      // bo'lsa pul avtomatik qaytariladi.
                      try {
                        await fetch('/api/orders/confirm', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            orderId: order.orderId,
                            status: finalStatus === 'completed' ? 'fulfilled' : 'failed',
                            deliveredName: foundUser?.name,
                            reason: failReason,
                          }),
                        })
                      } catch {
                        // tarmoq xatosi — buyurtma admin panelda "pending" qolib ko'rinadi
                      }

                      await refresh()
                      setSubmitting(false)

                      if (finalStatus === 'completed') {
                        playTushdiSound()
                        setConfirmingPremium(false)
                        setFoundUser(null)
                        setSentToPremium(targetUsername)
                        addNotification(
                          'Yetkazib berildi ✅',
                          `${months} oylik Premium — ${foundUser?.name ? `${foundUser.name} (@${targetUsername})` : `@${targetUsername}`} akkauntiga tashlab berildi.`,
                          { emoji: '💎', color: '#22c55e' },
                        )
                        setTimeout(() => setSentToPremium(null), 4000)
                      } else {
                        playUIEvent('insufficient')
                        setPurchaseError(
                          "Yetkazib berishda xatolik yuz berdi. To'langan mablag' balansingizga qaytarildi.",
                        )
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
