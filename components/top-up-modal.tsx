'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { X, Wallet, CreditCard, Clock3, AlertCircle, CheckCircle2, Copy } from 'lucide-react'
import { useBalance, formatUZS } from '@/components/balance-provider'
import { useNotifications } from '@/components/notification-context'

const QUICK_AMOUNTS = [20000, 50000, 100000, 220000, 500000, 1000000]
const POLL_INTERVAL_MS = 4000

function useCountdown(expiresAt: string | null) {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null)

  useEffect(() => {
    if (!expiresAt) {
      setSecondsLeft(null)
      return
    }
    const target = new Date(expiresAt.replace(' ', 'T')).getTime()
    const tick = () => setSecondsLeft(Math.max(0, Math.round((target - Date.now()) / 1000)))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [expiresAt])

  return secondsLeft
}

export function TopUpModal() {
  const { closeTopUp, requestTopUp, paymentInstructions, topUpRequest, checkTopUpStatus, clearTopUpRequest } =
    useBalance()
  const { addNotification } = useNotifications()
  const [amount, setAmount] = useState<number>(0)
  const [custom, setCustom] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [copied, setCopied] = useState<'card' | 'amount' | null>(null)
  const [checking, setChecking] = useState(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const finalAmount = custom ? Number(custom.replace(/\D/g, '')) : amount
  const secondsLeft = useCountdown(topUpRequest?.expiresAt ?? null)

  async function handleManualCheck() {
    if (checking) return
    setChecking(true)
    const result = await checkTopUpStatus()
    setChecking(false)
    if (result === 'pending') {
      addNotification("To'lov hali qabul qilinmadi", 'Bizga hali pul kelib tushmadi, biroz kuting yoki qayta urinib ko\'ring', {
        emoji: '⏳',
        color: '#fbbf24',
      })
    } else if (result === null) {
      addNotification('Tekshirib bo\'lmadi', "Server bilan bog'lanishda xatolik yuz berdi, qayta urinib ko'ring", {
        emoji: '⚠️',
        color: '#f87171',
      })
    }
    // 'approved' va 'rejected' holatlari uchun modal o'zi tegishli ekranni ko'rsatadi
  }

  // To'lov so'rovi ochiq va hali kutilmoqda bo'lsa — avtomatik holatni tekshirib turamiz
  useEffect(() => {
    if (topUpRequest?.status !== 'pending') {
      if (pollRef.current) clearInterval(pollRef.current)
      return
    }
    pollRef.current = setInterval(() => {
      checkTopUpStatus()
    }, POLL_INTERVAL_MS)
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topUpRequest?.status, topUpRequest?.id])

  useEffect(() => {
    if (topUpRequest?.status === 'approved') {
      addNotification("Balans to'ldirildi!", `${formatUZS(topUpRequest.amount)} UZS hisobingizga tushdi`, {
        emoji: '✅',
        color: '#34d399',
      })
    }
  }, [topUpRequest?.status])

  async function handleTopUp() {
    if (finalAmount <= 0 || status === 'submitting') return
    setStatus('submitting')
    const result = await requestTopUp(finalAmount)
    if (result.success) {
      setStatus('idle')
    } else {
      setStatus('error')
      setErrorMsg(result.error || "So'rov yuborilmadi. Qayta urinib ko'ring.")
    }
  }

  function copyText(text: string, which: 'card' | 'amount') {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(which)
      setTimeout(() => setCopied(null), 1500)
    })
  }

  function handleClose() {
    clearTopUpRequest()
    closeTopUp()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-background/70 backdrop-blur-sm sm:items-center"
      onClick={handleClose}
      role="button"
      data-disable-sound="true"
      aria-modal="true"
      aria-label="Hisobni to'ldirish"
    >
      <motion.div
        initial={{ y: 80, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 80, opacity: 0, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        className="glass mx-3 mb-3 w-full max-w-md rounded-3xl p-5 sm:mb-0"
        onClick={(e) => e.stopPropagation()}
      >
        {topUpRequest && topUpRequest.status === 'approved' ? (
          // ── Holat: to'lov tasdiqlandi ─────────────────────────────
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 18 }}
              className="flex size-14 items-center justify-center rounded-full bg-success/20 text-success"
            >
              <CheckCircle2 className="size-7" strokeWidth={2.5} aria-hidden="true" />
            </motion.span>
            <p className="text-sm font-bold text-foreground">To&apos;lov tasdiqlandi!</p>
            <p className="max-w-xs text-xs text-muted-foreground">
              {formatUZS(topUpRequest.amount)} UZS hisobingizga qo&apos;shildi.
            </p>
            <button
              type="button"
              onClick={handleClose}
              data-disable-sound="true"
              className="mt-2 rounded-full bg-secondary px-5 py-2 text-xs font-semibold text-foreground"
            >
              Yopish
            </button>
          </div>
        ) : topUpRequest && topUpRequest.status === 'pending' ? (
          // ── Holat: karta ko'rsatilmoqda, to'lov kutilmoqda ────────
          <div className="flex flex-col gap-3 py-2">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground">To&apos;lovni amalga oshiring</h2>
              <button
                type="button"
                onClick={handleClose}
                data-disable-sound="true"
                className="flex size-8 items-center justify-center rounded-full bg-secondary text-muted-foreground"
                aria-label="Yopish"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 rounded-xl bg-secondary/60 py-2 text-xs font-semibold text-muted-foreground">
              <Clock3 className="size-4" aria-hidden="true" />
              {secondsLeft !== null && secondsLeft > 0
                ? `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, '0')} qoldi`
                : 'Muddat tugamoqda...'}
            </div>

            <button
              type="button"
              data-disable-sound="true"
              onClick={() => topUpRequest.cardNumber && copyText(topUpRequest.cardNumber.replace(/\s/g, ''), 'card')}
              className="flex items-center justify-between rounded-2xl border border-gold/30 bg-gold/10 px-4 py-3 text-left"
            >
              <div>
                <p className="text-[10px] font-semibold uppercase text-muted-foreground">Karta raqami</p>
                <p className="font-mono text-sm font-bold text-foreground">{topUpRequest.cardNumber}</p>
              </div>
              <Copy className="size-4 text-gold" aria-hidden="true" />
            </button>
            {copied === 'card' && <p className="text-center text-[11px] text-success">Nusxalandi</p>}

            <button
              type="button"
              data-disable-sound="true"
              onClick={() => copyText(String(topUpRequest.amount), 'amount')}
              className="flex items-center justify-between rounded-2xl border border-border bg-secondary/60 px-4 py-3 text-left"
            >
              <div>
                <p className="text-[10px] font-semibold uppercase text-muted-foreground">Aniq summa</p>
                <p className="font-mono text-sm font-bold text-foreground">{formatUZS(topUpRequest.amount)} so&apos;m</p>
              </div>
              <Copy className="size-4 text-muted-foreground" aria-hidden="true" />
            </button>
            {copied === 'amount' && <p className="text-center text-[11px] text-success">Nusxalandi</p>}

            <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
              Ko&apos;rsatilgan <b>aniq summani</b> ko&apos;rsatilgan kartaga o&apos;tkazing. To&apos;lov tushishi bilan
              balansingiz avtomatik to&apos;ldiriladi — sahifani yopmang.
            </p>

            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={handleManualCheck}
              disabled={checking}
              data-disable-sound="true"
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-2xl bg-gold py-3 text-sm font-bold text-gold-foreground disabled:opacity-60"
            >
              {checking ? 'Tekshirilmoqda...' : "To'lovni tekshirish"}
            </motion.button>
          </div>
        ) : topUpRequest && topUpRequest.status === 'rejected' ? (
          // ── Holat: muddat tugadi / bekor bo'ldi ───────────────────
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-destructive/15 text-destructive">
              <AlertCircle className="size-7" aria-hidden="true" />
            </span>
            <p className="text-sm font-bold text-foreground">To&apos;lov muddati tugadi</p>
            <p className="max-w-xs text-xs text-muted-foreground">Qaytadan urinib ko&apos;ring.</p>
            <button
              type="button"
              onClick={() => clearTopUpRequest()}
              data-disable-sound="true"
              className="mt-2 rounded-full bg-gold px-5 py-2 text-xs font-semibold text-gold-foreground"
            >
              Qaytadan urinish
            </button>
          </div>
        ) : (
          // ── Holat: summa kiritish ──────────────────────────────────
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex size-9 items-center justify-center rounded-xl bg-success/15 text-success">
                  <Wallet className="size-5" aria-hidden="true" />
                </span>
                <h2 className="text-base font-bold text-foreground">Hisobni to&apos;ldirish</h2>
              </div>
              <button
                type="button"
                onClick={handleClose}
                data-disable-sound="true"
                className="flex size-8 items-center justify-center rounded-full bg-secondary text-muted-foreground"
                aria-label="Yopish"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>

            {paymentInstructions ? (
              <div className="mt-3 whitespace-pre-line rounded-2xl border border-gold/20 bg-gold/10 p-3 text-[11px] leading-relaxed text-gold-foreground/90">
                {paymentInstructions}
              </div>
            ) : null}

            <div className="mt-4 grid grid-cols-3 gap-2">
              {QUICK_AMOUNTS.map((a) => (
                <motion.button
                  key={a}
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setAmount(a)
                    setCustom('')
                  }}
                  className={`rounded-xl border px-2 py-2.5 font-mono text-xs font-bold transition-colors ${
                    amount === a && !custom
                      ? 'border-gold bg-gold/15 text-gold'
                      : 'border-border bg-secondary/60 text-muted-foreground'
                  }`}
                >
                  {formatUZS(a)}
                </motion.button>
              ))}
            </div>

            <input
              inputMode="numeric"
              value={custom}
              onChange={(e) => setCustom(e.target.value.replace(/\D/g, ''))}
              placeholder="Boshqa summa kiriting"
              className="mt-3 w-full rounded-xl border border-border bg-input px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-gold/60 focus:outline-none"
              aria-label="Summa kiriting"
            />

            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
              ⚠️ Keyingi bosqichda ko&apos;rsatiladigan <b>aniq summani</b> to&apos;liq kartaga o&apos;tkazing — u bir
              necha so&apos;mga farq qilishi mumkin (boshqa foydalanuvchilar to&apos;lovidan ajratish uchun). Boshqa
              summa yuborsangiz, to&apos;lov avtomatik aniqlanmaydi.
            </p>

            {status === 'error' ? (
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive">
                <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
                {errorMsg}
              </div>
            ) : null}

            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={handleTopUp}
              disabled={finalAmount <= 0 || status === 'submitting'}
              data-disable-sound="true"
              className="shimmer mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gold py-3.5 text-sm font-bold text-gold-foreground disabled:opacity-40"
            >
              {status === 'submitting' ? (
                'Yuborilmoqda...'
              ) : (
                <>
                  <CreditCard className="size-4" aria-hidden="true" />
                  {finalAmount > 0 ? `${formatUZS(finalAmount)} UZS to'ldirish` : "Summani tanlang"}
                </>
              )}
            </motion.button>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}
