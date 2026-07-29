'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Copy, Eye, Gift, Coins, RefreshCw, Wallet, Check } from 'lucide-react'
import { useBalance, formatUZS } from '@/components/balance-provider'
import { useTranslation } from '@/lib/languageManager'

const FILTERS = ['Barcha', 'Arzon ↑', 'Qimmat ↓', 'Yangi', 'Eski']

type NftItem = { id: string; name: string; model?: string; backdrop?: string; price: number; date?: string; image?: string }


export function NftGifts() {
  const [filter, setFilter] = useState('Barcha')
  const [copied, setCopied] = useState<string | null>(null)
  const { balance, purchase, openTopUp } = useBalance()
  const [bought, setBought] = useState<string | null>(null)
  const [nfts, setNfts] = useState<NftItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { t } = useTranslation() as any

  function handleCopy(id: string, name: string) {
    navigator.clipboard?.writeText(name).catch(() => {})
    setCopied(id)
    setTimeout(() => setCopied(null), 1400)
  }

  useEffect(() => {
    let mounted = true
    setLoading(true)
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://6a4cc7f182c08.xvest2.ru'
    fetch(`${API_BASE}/api/gifts.php?category=nft_gift`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return
        const list = data?.gifts || []
        setNfts(list)
        setError(null)
      })
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false))
    return () => {
      mounted = false
    }
  }, [])

  async function handleBuy(nft: { id: string; name: string; price: number }) {
    if (balance < nft.price) {
      openTopUp()
      return
    }
    const result = await purchase({
      category: 'nft_gift',
      productKey: nft.id,
      amount: nft.price,
      productName: nft.name,
    })
    if (result.success) {
      setBought(nft.id)
      setTimeout(() => setBought(null), 2000)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Saralash">
        {FILTERS.map((f) => (
          <motion.button
            key={f}
            type="button"
            whileTap={{ scale: 0.94 }}
            onClick={() => setFilter(f)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${
              filter === f
                ? 'bg-accent text-accent-foreground glow-violet'
                : 'border border-border bg-card text-muted-foreground'
            }`}
            aria-pressed={filter === f}
          >
            {t('filters.' + (f === 'Barcha' ? 'all' : f === 'Arzon ↑' ? 'cheapest' : f === 'Qimmat ↓' ? 'expensive' : f === 'Yangi' ? 'new' : 'old'))}
          </motion.button>
        ))}
      </div>

      {/* Stats */}
      <div className="flex gap-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-1 items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3"
        >
          <span className="flex size-9 items-center justify-center rounded-full bg-price/20">
            <Gift className="size-4 text-price" aria-hidden="true" />
          </span>
          <span className="flex flex-col">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Jami giftlar
              </span>
              <span className="font-mono text-lg font-bold text-foreground">{loading ? '...' : nfts.length}</span>
          </span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex flex-1 items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3"
        >
          <span className="flex size-9 items-center justify-center rounded-full bg-gold/20">
            <Coins className="size-4 text-gold" aria-hidden="true" />
          </span>
          <span className="flex flex-col">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Eng arzon
            </span>
            <span className="font-mono text-lg font-bold text-foreground">
              {loading ? '...' : nfts.length ? formatUZS(Math.min(...nfts.map((n) => n.price))) : '—'}
            </span>
          </span>
        </motion.div>
      </div>

      {/* List */}
      <section className="rounded-3xl border border-border bg-card p-4" aria-label="NFT giftlar ro'yxati">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground">{t('gifts.list.title')}</h2>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {nfts.length} ta
            <RefreshCw className="size-3.5" aria-hidden="true" />
          </span>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-4">
          {loading ? (
            <div className="p-4 text-sm text-white/60">Giftlar yuklanmoqda...</div>
          ) : error ? (
            <div className="p-4 text-sm text-red-400">Xatolik: {error}</div>
          ) : (
            nfts.map((nft, i) => (
              <motion.article
                key={nft.id}
                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: i * 0.07, type: 'spring', stiffness: 300, damping: 26 }}
                className="max-w-56 overflow-hidden rounded-3xl border border-border bg-secondary/60"
              >
                <motion.div whileHover={{ scale: 1.03 }} className="relative m-2 overflow-hidden rounded-2xl">
                  <Image
                    src={nft.image || '/placeholder.svg'}
                    alt={nft.name + ' NFT gifti'}
                    width={400}
                    height={400}
                    className="aspect-square w-full object-cover"
                  />
                </motion.div>
                <div className="flex flex-col gap-1 px-3 pb-3">
                  <h3 className="text-sm font-bold text-foreground">{nft.name}</h3>
                  <p className="text-[11px] text-muted-foreground">
                    {nft.model} &middot; {nft.backdrop}
                  </p>
                  <p className="font-mono text-sm font-bold text-price">
                    {formatUZS(nft.price)} <span className="text-[10px]">UZS</span>
                  </p>
                  <p className="text-[10px] text-muted-foreground">{nft.date}</p>

                  <div className="mt-1.5 flex gap-2">
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.94 }}
                      onClick={() => handleCopy(nft.id, nft.name)}
                      className="flex flex-1 items-center justify-center gap-1 rounded-full border border-border bg-card py-1.5 text-[11px] font-semibold text-foreground"
                    >
                      {copied === nft.id ? (
                        <Check className="size-3 text-success" aria-hidden="true" />
                      ) : (
                        <Copy className="size-3" aria-hidden="true" />
                      )}
                      {t('action.copy')}
                    </motion.button>
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.94 }}
                      className="flex flex-1 items-center justify-center gap-1 rounded-full border border-border bg-card py-1.5 text-[11px] font-semibold text-foreground"
                    >
                      <Eye className="size-3" aria-hidden="true" />
                      {t('action.view')}
                    </motion.button>
                  </div>

                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleBuy(nft)}
                    data-disable-sound="true"
                    className="shimmer mt-1.5 flex items-center justify-center gap-1.5 rounded-full border border-gold/50 bg-gold/10 py-2 text-xs font-bold text-gold"
                  >
                    {bought === nft.id ? (
                      <span className="flex items-center gap-1">
                        <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
                        {t('purchase.send')}
                      </span>
                    ) : balance >= nft.price ? (
                      <span className="flex items-center gap-1">
                        <Coins className="size-3.5" aria-hidden="true" />
                        {t('purchase.buy')}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Wallet className="size-3.5" aria-hidden="true" />
                        {t('balance.topup')}
                      </span>
                    )}
                  </motion.button>
                </div>
              </motion.article>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
