'use client'

import { useEffect, useState } from 'react'

const TITLE = 'Haqiqiy Telegramdan foydalaning'
const MESSAGE = 'Bu sahifa faqat Telegram ilovasi ichida ishlaydi. Web brauzer yoki Web Telegram orqali ochgan bo‘lsangiz, iltimos rasmiy Telegram mobil ilovasidan oching.'

export function TelegramAccessScreen() {
  const [status, setStatus] = useState<'checking' | 'blocked'>('checking')

  useEffect(() => {
    if (typeof window === 'undefined') return

    const tg = (window as any).Telegram?.WebApp
    const isTelegramApp = Boolean(
      tg && (typeof tg.initData === 'string' || tg.initDataUnsafe || tg.ready),
    )

    if (isTelegramApp) {
      return
    }

    setStatus('blocked')
  }, [])

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex min-h-screen flex-col items-center justify-center px-5 py-10 text-center">
        <div className="relative mb-8 w-full max-w-lg overflow-hidden rounded-[28px] border border-white/10 bg-zinc-950 shadow-[0_40px_120px_rgba(0,0,0,0.55)] mx-auto">
          <video
            className="h-[260px] w-full object-cover"
            src="/video/StarDuck_by_TgEmodziBot_AgADa2wAAt0nqEs.mp4"
            poster="/placeholder.jpg"
            autoPlay
            loop
            muted
            playsInline
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/70" />
        </div>

        <div className="max-w-xl space-y-4">
          <p className="text-sm uppercase tracking-[0.35em] text-white/60">Yuqori xavfsizlik</p>
          <h1 className="text-3xl font-semibold text-white sm:text-4xl">{TITLE}</h1>
          <p className="mx-auto max-w-2xl text-sm leading-7 text-white/80">{MESSAGE}</p>
        </div>

        <div className="mt-10 flex flex-col items-center gap-3 rounded-3xl border border-white/10 bg-white/5 px-6 py-5 text-sm text-white/80 shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-3.5 w-3.5 animate-pulse rounded-full bg-cyan-400" />
            <span>{status === 'checking' ? 'Tekshirilmoqda...' : 'Telegram ilovasini oching'}</span>
          </div>
          <div className="h-2 w-40 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-1/2 animate-[pulse_1.4s_linear_infinite] rounded-full bg-cyan-400" />
          </div>
        </div>
      </div>
    </div>
  )
}
