'use client'

import { useEffect, useState } from 'react'
import { TelegramAccessScreen } from '@/components/telegram-access-screen'

function isTelegramWebAppAvailable() {
  if (typeof window === 'undefined') return false

  const tg = (window as any).Telegram?.WebApp
  if (!tg) return false

  const host = window.location.hostname.toLowerCase()
  if (host === 'web.telegram.org' || host === 'webk.telegram.org' || host.endsWith('.web.telegram.org')) {
    return false
  }

  const platform = typeof tg.platform === 'string' ? tg.platform.toLowerCase() : ''
  const isNativeTelegramPlatform = ['android', 'ios', 'mac', 'windows', 'desktop', 'tdesktop'].includes(platform)
  if (!isNativeTelegramPlatform) return false

  const hasInitData = typeof tg.initData === 'string' && tg.initData.length > 0
  const hasUnsafeUser = Boolean(tg.initDataUnsafe && tg.initDataUnsafe.user)
  const hasAnyInit = hasInitData || hasUnsafeUser

  return hasAnyInit
}

export function TelegramGate({ children }: { children: React.ReactNode }) {
  const [accessState, setAccessState] = useState<'checking' | 'allowed' | 'blocked'>('checking')

  useEffect(() => {
    if (isTelegramWebAppAvailable()) {
      setAccessState('allowed')
      return
    }

    const timeout = window.setTimeout(() => setAccessState('blocked'), 200)
    return () => window.clearTimeout(timeout)
  }, [])

  if (accessState === 'checking') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-5 text-center shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
          <div className="mb-3 text-sm uppercase tracking-[0.32em] text-cyan-300/80">Tekshirilmoqda</div>
          <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-full animate-pulse rounded-full bg-cyan-400" />
          </div>
          <p className="mt-4 text-sm text-white/70">Iltimos bir soniya kuting...</p>
        </div>
      </div>
    )
  }

  if (accessState === 'blocked') {
    return <TelegramAccessScreen />
  }

  return <>{children}</>
}
