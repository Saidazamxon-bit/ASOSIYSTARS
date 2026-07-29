'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Wallet, CreditCard, Clock3, AlertCircle } from 'lucide-react'
import { useBalance, formatUZS } from '@/components/balance-provider'
import { useNotifications } from '@/components/notification-context'

const QUICK_AMOUNTS = [20000, 50000, 100000, 220000, 500000, 1000000]

export function TopUpModal() {
  const { closeTopUp, requestTopUp, paymentInstructions } = useBalance()
  const { addNotification } = useNotifications()
  const [amount, setAmount] = useState<number>(0)
  const [custom, setCustom] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'pending' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const finalAmount = custom ? Number(custom.replace(/\D/g, '')) : amount

  async function handleTopUp() {
    if (finalAmount <= 0 || status === 'submitting') return
    setStatus('submitting')
    const result = await requestTopUp(finalAmount)
    if (result.success) {
      setStatus('pending')
      addNotification(
        "Balans to'ldirish so'rovi yuborildi",
        `${formatUZS(finalAmount)} UZS uchun so'rov qabul qilindi`,
        { emoji: '💸', color: '#34d399' }
      )
    } else {
      setStatus('error')
      setErrorMsg(result.error || "So'rov yuborilmadi. Qayta urinib ko'ring.")
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-background/70 backdrop-blur-sm sm:items-center"
      onClick={closeTopUp}
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
        {status === 'pending' ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 18 }}
              className="flex size-14 items-center justify-center rounded-full bg-gold/20 text-gold glow-gold"
            >
              <Clock3 className="size-7" strokeWidth={2.5} aria-hidden="true" />
            </motion.span>
            <p className="text-sm font-bold text-foreground">
              So'rov qabul qilindi
            </p>
            <p className="max-w-xs text-xs text-muted-foreground">
              {formatUZS(finalAmount)} UZS uchun to'lovni amalga oshiring. Admin tasdiqlagach,
              hisobingiz avtomatik to'ldiriladi.
            </p>
            <button
              type="button"
              onClick={closeTopUp}
              data-disable-sound="true"
              className="mt-2 rounded-full bg-secondary px-5 py-2 text-xs font-semibold text-foreground"
            >
              Yopish
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex size-9 items-center justify-center rounded-xl bg-success/15 text-success">
                  <Wallet className="size-5" aria-hidden="true" />
                </span>
                <h2 className="text-base font-bold text-foreground">
                  Hisobni to&apos;ldirish
                </h2>
              </div>
              <button
                type="button"
                onClick={closeTopUp}
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
                "Yuborilmoqda..."
              ) : (
                <>
                  <CreditCard className="size-4" aria-hidden="true" />
                  {finalAmount > 0 ? `${formatUZS(finalAmount)} UZS so'rov yuborish` : "So'rov yuborish"}
                </>
              )}
            </motion.button>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}
