'use client'

import { useMemo } from 'react'

function VideoPreview() {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-black/95 shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
      <video
        className="aspect-[16/9] h-full w-full object-cover"
        src="/telegram-warning.mp4"
        autoPlay
        loop
        muted
        playsInline
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/80" />
      <div className="border-t border-white/10 px-4 py-3 text-left text-xs uppercase tracking-[0.3em] text-white/50">
        Telegram-da yuklanmoqda... iltimos haqiqiy Telegramdan foydalaning.
      </div>
    </div>
  )
}

export function TelegramAccessScreen() {
  const details = useMemo(
    () => [
      'Web brauzer yoki Web Telegram orqali ochilgan.',
      'Bu sahifa faqat haqiqiy Telegram ilovasida ishlaydi.',
      'Iltimos, Telegram mobil ilovasida oching.',
    ],
    [],
  )

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="relative mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-8 px-5 py-10 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.18),_transparent_28%)]" aria-hidden="true" />
        <div className="relative z-10 w-full px-2">
          <p className="text-sm uppercase tracking-[0.36em] text-cyan-300/80">Telegram faqat</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl">Haqiqiy Telegramdan foydalaning</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
            Bu sahifa faqat Telegram ichidagi o‘ziga xos WebApp muhitida ishlaydi. Agar siz brauzer yoki Web Telegram orqali kirgan bo‘lsangiz, iltimos rasmiy mobil Telegram ilovasidan oching.
          </p>
        </div>

        <div className="relative z-10 w-full px-2">
          <VideoPreview />
        </div>

        <div className="relative z-10 w-full px-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-left text-sm text-white/80 shadow-[0_24px_80px_rgba(0,0,0,0.24)] backdrop-blur-xl">
            <div className="mb-3 flex items-center gap-3">
              <span className="inline-flex h-3.5 w-3.5 animate-pulse rounded-full bg-cyan-400" />
              <span className="font-semibold">Loading...</span>
            </div>
            <div className="space-y-2">
              {details.map((line) => (
                <div key={line} className="rounded-2xl bg-white/5 px-3 py-2 text-white/70">
                  {line}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
