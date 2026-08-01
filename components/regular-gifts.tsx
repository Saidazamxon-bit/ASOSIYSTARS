'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Gift, Coins, RefreshCw, ArrowUp, ArrowDown, Check } from 'lucide-react'
import { useBalance, formatUZS } from '@/components/balance-provider'
import { useTranslation } from '@/lib/languageManager'
import { starstgClient } from '@/lib/starstg-client'

type GiftItem = {
  id: string
  name: string
  emoji?: string
  imageUrl?: string | null
  price: number
  tier?: 'Common' | 'Unique' | string
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://6a4cc7f182c08.xvest2.ru'

const TIERS = ['Barcha', 'Common', 'Unique'] as const

export function RegularGifts() {
  const [sort, setSort] = useState<'asc' | 'desc'>('asc')
  const [tier, setTier] = useState<(typeof TIERS)[number]>('Barcha')
  const { balance, purchase, openTopUp } = useBalance()
  const [bought, setBought] = useState<string | null>(null)
  const [boughtTo, setBoughtTo] = useState<string | null>(null)
  const [confirmingGift, setConfirmingGift] = useState<GiftItem | null>(null)
  const [recipient, setRecipient] = useState('')
  const [recipientTouched, setRecipientTouched] = useState(false)
  const [purchaseError, setPurchaseError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [foundUser, setFoundUser] = useState<{ name: string; photo?: string; recipient: string } | null>(null)
  const [checkingUser, setCheckingUser] = useState(false)
  const { t } = useTranslation() as any

  const [gifts, setGifts] = useState<GiftItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    fetch(`${API_BASE}/api/gifts.php?category=regular_gift`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return
        setGifts(data?.gifts || [])
        setError(null)
      })
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false))
    return () => {
      mounted = false
    }
  }, [])

  const list = useMemo(() => {
    const filtered = tier === 'Barcha' ? gifts : gifts.filter((g) => g.tier === tier)
    return [...filtered].sort((a, b) => (sort === 'asc' ? a.price - b.price : b.price - a.price))
  }, [sort, tier, gifts])

  function handleBuy(g: GiftItem) {
    if (balance < g.price) {
      openTopUp()
      return
    }
    setRecipient('')
    setRecipientTouched(false)
    setPurchaseError(null)
    setFoundUser(null)
    setConfirmingGift(g)
  }

  async function checkUser() {
    if (!recipient.trim()) {
      setRecipientTouched(true)
      return
    }
    setPurchaseError(null)
    setCheckingUser(true)
    try {
      const res = await starstgClient.search('stars', recipient.trim())
      if (res.success && res.found) {
        setFoundUser({ name: res.found.name, photo: res.found.photo, recipient: res.found.recipient })
      } else {
        setPurchaseError('Bunday foydalanuvchi mavjud emas')
      }
    } catch (err) {
      setPurchaseError('Bunday foydalanuvchi mavjud emas')
    }
    setCheckingUser(false)
  }

  async function confirmBuy() {
    if (!confirmingGift || !foundUser) return
    setSubmitting(true)
    setPurchaseError(null)
    const result = await purchase({
      category: 'regular_gift',
      productKey: confirmingGift.id,
      targetUsername: foundUser.recipient,
      amount: confirmingGift.price,
      productName: confirmingGift.name,
    })
    setSubmitting(false)
    if (result.success) {
      setBought(confirmingGift.id)
      setBoughtTo(foundUser.recipient)
      setConfirmingGift(null)
      setFoundUser(null)
      setTimeout(() => {
        setBought(null)
        setBoughtTo(null)
      }, 1600)
    } else {
      setPurchaseError(result.error || 'Xatolik yuz berdi')
    }
  }

  function cancelBuy() {
    setConfirmingGift(null)
    setFoundUser(null)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Sort */}
      <div className="flex gap-2" role="group" aria-label="Narx bo'yicha saralash">
        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          onClick={() => setSort('asc')}
          className={`flex items-center gap-1 rounded-full px-3.5 py-1.5 text-xs font-bold ${
            sort === 'asc'
              ? 'bg-accent text-accent-foreground glow-violet'
              : 'border border-border bg-card text-muted-foreground'
          }`}
          aria-pressed={sort === 'asc'}
        >
          {t('sort.asc')} <ArrowUp className="size-3" aria-hidden="true" />
        </motion.button>
        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          onClick={() => setSort('desc')}
          className={`flex items-center gap-1 rounded-full px-3.5 py-1.5 text-xs font-bold ${
            sort === 'desc'
              ? 'bg-accent text-accent-foreground glow-violet'
              : 'border border-border bg-card text-muted-foreground'
          }`}
          aria-pressed={sort === 'desc'}
        >
          {t('sort.desc')} <ArrowDown className="size-3" aria-hidden="true" />
        </motion.button>
      </div>

      {/* Tier filter */}
      <div className="flex gap-2" role="group" aria-label="Gift darajasi">
        {TIERS.map((tierLabel) => (
          <motion.button
            key={tierLabel}
            type="button"
            whileTap={{ scale: 0.94 }}
            onClick={() => setTier(tierLabel)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-bold ${
              tier === tierLabel
                ? 'bg-accent text-accent-foreground glow-violet'
                : 'border border-border bg-card text-muted-foreground'
            }`}
            aria-pressed={tier === tierLabel}
          >
            {tierLabel === 'Barcha' ? t('filters.all') : tierLabel}
          </motion.button>
        ))}
      </div>

      {/* Stats */}
      <div className="flex gap-3">
        <div className="flex flex-1 items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3">
          <span className="flex size-9 items-center justify-center rounded-full bg-price/20">
            <Gift className="size-4 text-price" aria-hidden="true" />
          </span>
          <span className="flex flex-col">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {t('gifts.total')}
              </span>
            <span className="font-mono text-lg font-bold text-foreground">{list.length}</span>
          </span>
        </div>
        <div className="flex flex-1 items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3">
          <span className="flex size-9 items-center justify-center rounded-full bg-gold/20">
            <Coins className="size-4 text-gold" aria-hidden="true" />
          </span>
          <span className="flex flex-col">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t('gifts.cheapest')}
            </span>
            <span className="font-mono text-lg font-bold text-foreground">
              {list.length ? formatUZS(Math.min(...list.map((g) => g.price))) : '—'}
            </span>
          </span>
        </div>
      </div>

      {/* Grid */}
      <section className="rounded-3xl border border-border bg-card p-4" aria-label="Oddiy giftlar ro'yxati">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground">{t('gifts.list.title')}</h2>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {loading ? '...' : list.length + ' ta'}
            <RefreshCw className="size-3.5" aria-hidden="true" />
          </span>
        </div>

        <motion.div layout className="mt-3 grid grid-cols-3 gap-3">
          {loading ? (
            <div className="p-4 text-sm text-white/60">Giftlar yuklanmoqda...</div>
          ) : error ? (
            <div className="p-4 text-sm text-red-400">Xatolik: {error}</div>
          ) : (
            <AnimatePresence mode="popLayout">
              {list.map((g, i) => (
                <motion.button
                  layout
                  key={g.id}
                  type="button"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ delay: i * 0.025, type: 'spring', stiffness: 340, damping: 26 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => handleBuy(g)}
                  data-disable-sound="true"
                  className="relative flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-secondary/60 px-2 pb-3 pt-4"
                  aria-label={g.name + ' — ' + formatUZS(g.price) + ' UZS, ' + t('purchase.buy')}
                >
                  {g.imageUrl ? (
                    <img
                      src={`${API_BASE}${g.imageUrl}`}
                      alt={g.name}
                      className="h-10 w-10 object-contain"
                      onError={(e) => {
                        // Telegram'dan rasm hali keshlanmagan/topilmagan bo'lsa — emojiga qaytamiz.
                        const target = e.currentTarget
                        const fallback = document.createElement('span')
                        fallback.textContent = g.emoji || '🎁'
                        fallback.className = 'text-4xl leading-none'
                        target.replaceWith(fallback)
                      }}
                    />
                  ) : (
                    <span className="text-4xl leading-none" role="img" aria-hidden="true">
                      {g.emoji}
                    </span>
                  )}
                  <span className="text-xs font-bold text-foreground">{g.name}</span>
                  <span className="font-mono text-[11px] font-bold text-price">
                    {formatUZS(g.price)} <span className="text-[9px]">UZS</span>
                  </span>
                  <AnimatePresence>
                    {bought === g.id && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center rounded-2xl bg-background/80"
                      >
                        <span className="flex items-center gap-1 rounded-full bg-success/20 px-2.5 py-1 text-[11px] font-bold text-success">
                          <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
                          {t('purchase.send')}
                        </span>
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              ))}
            </AnimatePresence>
          )}
        </motion.div>
      </section>

      <AnimatePresence>
        {confirmingGift && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 py-6 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl shadow-black/10"
              initial={{ y: 24, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 24, opacity: 0, scale: 0.98 }}
            >
              <div className="flex flex-col gap-4">
                <div className="rounded-3xl bg-secondary/70 p-4 text-center">
                  <p className="text-sm font-bold uppercase tracking-[0.25em] text-muted-foreground">
                    {t('purchase.confirmTitle')}
                  </p>
                  <p className="mt-3 text-base font-semibold text-foreground">
                    {t('purchase.confirmBody', { name: confirmingGift.name, amount: formatUZS(confirmingGift.price) })}
                  </p>
                </div>

                {foundUser ? (
                  <div className="flex flex-col items-center gap-2 rounded-3xl bg-secondary/70 p-4 text-center">
                    <div className="h-16 w-16 overflow-hidden rounded-full border border-gold/40 bg-background/40">
                      {foundUser.photo ? (
                        <img src={foundUser.photo} alt={foundUser.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-muted-foreground">
                          {foundUser.name?.[0]?.toUpperCase() || '?'}
                        </div>
                      )}
                    </div>
                    <p className="text-base font-semibold text-foreground">{foundUser.name}</p>
                    <p className="text-xs text-muted-foreground">@{foundUser.recipient}</p>
                    <p className="mt-1 text-xs font-semibold text-gold">Shu odamgami?</p>
                  </div>
                ) : (
                  <div className="mt-4">
                    <label className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground" htmlFor="gift-recipient">
                      {t('purchase.recipient')}
                    </label>
                    <input
                      id="gift-recipient"
                      value={recipient}
                      onChange={(event) => {
                        setRecipient(event.target.value)
                        setPurchaseError(null)
                      }}
                      onBlur={() => setRecipientTouched(true)}
                      placeholder={t('purchase.recipient.placeholder')}
                      className="mt-2 w-full rounded-2xl border border-border bg-input px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-gold/60 focus:outline-none"
                      aria-label={t('purchase.recipient')}
                    />
                    {recipientTouched && !recipient.trim() ? (
                      <p className="mt-2 text-xs text-destructive">{t('purchase.recipientRequired')}</p>
                    ) : null}
                    {purchaseError ? (
                      <p className="mt-2 text-xs font-semibold text-destructive">{purchaseError}</p>
                    ) : null}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={foundUser ? () => setFoundUser(null) : cancelBuy}
                    className="flex-1 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-bold text-muted-foreground"
                  >
                    {t('action.cancel')}
                  </button>
                  {foundUser ? (
                    <button
                      type="button"
                      onClick={confirmBuy}
                      disabled={submitting}
                      className="flex-1 rounded-2xl bg-gold px-4 py-3 text-sm font-bold text-gold-foreground disabled:opacity-40"
                    >
                      {submitting ? '...' : t('purchase.confirm')}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={checkUser}
                      disabled={!recipient.trim() || checkingUser}
                      className="flex-1 rounded-2xl bg-gold px-4 py-3 text-sm font-bold text-gold-foreground disabled:opacity-40"
                    >
                      {checkingUser ? '...' : 'Keyingisi'}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
