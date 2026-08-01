'use client'

import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

// NFT giftlar hozircha mavjud emas. Backend (api/gifts.php?category=nft_gift)
// ham bo'sh ro'yxat qaytaradi, lekin bu yerda holatni har doim aniq va
// tezkor ko'rsatish uchun statik "hozircha mavjud emas" holati chiqariladi.
export function NftGifts() {
  return (
    <div className="flex flex-col gap-4">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-3 rounded-3xl border border-border bg-card px-6 py-14 text-center"
      >
        <span className="flex size-14 items-center justify-center rounded-full bg-accent/15">
          <Sparkles className="size-6 text-accent" aria-hidden="true" />
        </span>
        <h2 className="text-base font-bold text-foreground">NFT giftlar hozircha mavjud emas</h2>
        <p className="max-w-xs text-sm text-muted-foreground">
          Bu bo'lim tez orada ishga tushiriladi. Hozircha "Oddiy giftlar" bo'limidan foydalanishingiz mumkin.
        </p>
      </motion.section>
    </div>
  )
}
