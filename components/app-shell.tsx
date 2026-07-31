"use client"

import React, { useCallback, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { AnimatePresence, motion, PanInfo, useAnimation, useMotionValue } from 'framer-motion'
import { Home, Store, Wallet, Globe, Plus, User, Briefcase } from 'lucide-react'
import { useBalance, formatUZS } from '@/components/balance-provider'
import { NumberTicker } from '@/registry/magicui/number-ticker'
import { TopUpModal } from '@/components/top-up-modal'
import { TopUpWatcher } from '@/components/topup-watcher'
import { NotificationsProvider } from '@/components/notification-context'
import { primeAudio, initClickSoundHandler } from '@/lib/sounds'
import LanguageInit from '@/components/language-init'
import { useTranslation } from '@/lib/languageManager'

const NAV_ITEMS = [
  { href: '/', labelKey: 'nav.home', icon: Home },
  { href: '/market', labelKey: 'nav.market', icon: Store },
  { href: '/balans', labelKey: 'nav.balance', icon: Wallet },
  { href: '/profile', labelKey: 'nav.profile', icon: User },
]

function pageTitle(pathname: string, t: (key: string) => string) {
  if (pathname.startsWith('/market')) return t('page.market')
  if (pathname.startsWith('/case')) return t('page.case')
  if (pathname.startsWith('/balans')) return t('page.balance')
  if (pathname.startsWith('/profile')) return t('page.profile')
  return t('page.home')
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { balance, balanceLoaded, openTopUp, isTopUpOpen, authError } = useBalance()
  const { t, lang } = useTranslation() as any
  const [balanceSeen, setBalanceSeen] = React.useState(() => {
    if (typeof window === 'undefined') return false
    return sessionStorage.getItem('ultra:balance-shown') === '1'
  })

  React.useEffect(() => {
    if (typeof window === 'undefined') return
    if (!balanceSeen) {
      sessionStorage.setItem('ultra:balance-shown', '1')
      setBalanceSeen(true)
    }

    const primer = () => {
      try { primeAudio() } catch (e) {}
      document.removeEventListener('pointerdown', primer, { capture: true } as any)
    }
    document.addEventListener('pointerdown', primer, { capture: true })

    const off = initClickSoundHandler()
    return () => {
      document.removeEventListener('pointerdown', primer, { capture: true } as any)
      off && off()
    }
  }, [])

  const navigateTo = React.useCallback(
    (href: string) => {
      if (href === pathname) return
      router.push(href)
    },
    [pathname, router]
  )

  const NAV_MEMO = useMemo(() => NAV_ITEMS, [])

  const activeIndex = useMemo(() => NAV_MEMO.findIndex((it) => (it.href === '/' ? pathname === '/' : pathname.startsWith(it.href))), [NAV_MEMO, pathname])

  const triggerHaptic = useCallback((type: 'selectionChanged' | 'impactLight' | 'impactMedium' | 'impactSuccess') => {
    try {
      const tg = (window as any).Telegram?.WebApp
      if (!tg) return
      if (type === 'selectionChanged' && typeof tg.selectionChanged === 'function') tg.selectionChanged()
      if (type === 'impactLight' && typeof tg.impactOccurred === 'function') tg.impactOccurred('light')
      if (type === 'impactMedium' && typeof tg.impactOccurred === 'function') tg.impactOccurred('medium')
      if (type === 'impactSuccess' && typeof tg.impactOccurred === 'function') tg.impactOccurred('success')
    } catch (e) {}
  }, [])

  const mainRef = useRef<HTMLDivElement | null>(null)
  const dragCooldown = useRef(false)
  const controls = useAnimation()
  const x = useMotionValue(0)
  const [isDragging, setIsDragging] = useState(false)

  const handleDragEnd = useCallback((e: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
    if (dragCooldown.current) return
    const width = mainRef.current?.clientWidth || window.innerWidth
    const offsetX = info.offset.x
    const absX = Math.abs(offsetX)
    const velocityX = info.velocity.x
    const shouldNavigate = absX > width * 0.32 || Math.abs(velocityX) > 650
    const dir = offsetX < 0 ? 1 : -1
    const targetIndex = Math.max(0, Math.min(NAV_MEMO.length - 1, activeIndex + dir))

    if (!shouldNavigate || targetIndex === activeIndex) {
      controls.start({ x: 0, transition: { type: 'spring', stiffness: 280, damping: 28, mass: 0.8 } })
      setIsDragging(false)
      return
    }

    dragCooldown.current = true
    const targetHref = NAV_MEMO[targetIndex].href
    controls.start({ x: dir < 0 ? width : -width, transition: { type: 'spring', stiffness: 260, damping: 28, mass: 0.74 } }).then(() => {
      navigateTo(targetHref)
      x.set(0)
      dragCooldown.current = false
      setIsDragging(false)
    })
    triggerHaptic('selectionChanged')
  }, [NAV_MEMO, activeIndex, controls, navigateTo, triggerHaptic])

  const handleDragStart = useCallback(() => {
    setIsDragging(true)
  }, [])

  return (
    <NotificationsProvider>
      <div className="app-shell mx-auto flex min-h-dvh w-full max-w-md flex-col">
        <LanguageInit />
        <div className="app-shell-background" aria-hidden="true" />

        {authError ? (
        <div className="mx-3 mb-3 rounded-3xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100 shadow-sm">
          <strong className="block font-semibold">Iltimos, ilovani Telegram ichida oching.</strong>
          <span className="block mt-1 text-rose-100/90">{authError ? String(authError) : ''}</span>
        </div>
      ) : null}

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[rgba(6,9,19,0.92)] backdrop-blur-3xl">
        <div className="flex items-center justify-between gap-2 px-3 py-[calc(0.75rem+env(safe-area-inset-top))]">
          <motion.button
            type="button"
            onClick={openTopUp}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/85 shadow-[0_10px_30px_rgba(0,0,0,0.18)]"
            aria-label={t('balance.topup')}
          >
            <Wallet className="size-4 text-gold" aria-hidden="true" />
            <span className="font-mono text-sm font-semibold">
              {formatUZS(balance)}
            </span>
            <span className="text-[10px] uppercase tracking-[0.28em] text-white/60">UZS</span>
          </motion.button>

          <motion.h1 className="text-lg font-semibold text-white">
            {pageTitle(pathname, t)}
          </motion.h1>

          <button
            type="button"
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/70"
            aria-label={t('settings.language.label')}
          >
            <Globe className="size-4" aria-hidden="true" />
            {lang}
          </button>
        </div>
      </header>

      <main className="flex-1 px-3 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-4 overflow-hidden">
        <motion.div
          ref={mainRef}
          animate={controls}
          style={{ x, touchAction: 'pan-y' }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.12}
          dragMomentum={false}
          dragDirectionLock
          onDragStart={handleDragStart}
          onDragEnd={(e, info) => handleDragEnd(e as any, info)}
          className="w-full"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="w-full"
          >
            {children}
          </motion.div>
        </motion.div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-md px-3 pb-[calc(env(safe-area-inset-bottom)+0.62rem)]">
        <div
          className="glass-nav flex items-center justify-between gap-2 rounded-[24px] border border-white/10 bg-white/5 px-3 py-2 shadow-[0_10px_30px_rgba(0,0,0,0.18)] backdrop-blur-2xl"
          aria-label="Main navigation"
        >
          {NAV_MEMO.map((item, i) => {
            const active = i === activeIndex
            const Icon = item.icon
            const label = (t as any)(item.labelKey)
            return (
              <NavItem
                key={item.href}
                icon={Icon}
                label={label}
                active={active}
                onClick={() => {
                  navigateTo(item.href)
                  triggerHaptic('selectionChanged')
                }}
                onActivate={() => triggerHaptic('impactLight')}
              />
            )
          })}
        </div>
      </nav>

      <TopUpWatcher />
      <AnimatePresence>{isTopUpOpen && <TopUpModal />}</AnimatePresence>
      </div>
    </NotificationsProvider>
  )
}

const NavItem = React.memo(function NavItem({ icon: Icon, label, active, onClick, onActivate }: { icon: any; label: string; active: boolean; onClick: () => void; onActivate?: () => void }) {
  const btnRef = useRef<HTMLButtonElement | null>(null)
  const [rippleKey, setRippleKey] = useState(0)

  const handlePointerDown = useCallback(() => {
    setRippleKey((k) => k + 1)
  }, [])

  return (
    <button
      ref={btnRef}
      type="button"
      onClick={() => {
        onClick()
        onActivate && onActivate()
      }}
      onPointerDown={handlePointerDown}
      className={`relative flex flex-1 flex-col items-center gap-1 rounded-[24px] px-3 py-2 text-[11px] font-semibold transition-all duration-150 ${active ? 'text-white bg-white/10 shadow-[0_10px_24px_rgba(255,255,255,0.12)]' : 'text-white/60 hover:text-white/90'}`}
      data-ripple-key={rippleKey}
      aria-current={active ? 'page' : undefined}
    >
      <motion.span
        initial={false}
        animate={active ? { y: -2, scale: 1.05 } : { y: 0, scale: 1 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
      >
        <Icon className={active ? 'size-6' : 'size-5'} aria-hidden="true" />
      </motion.span>

      <motion.span
        initial={{ opacity: 0, y: 4, scale: 0.98 }}
        animate={active ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0.75, y: 0, scale: 0.98 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className="relative z-10 text-[11px] leading-none"
      >
        {label}
      </motion.span>

      <span className="nav-ripple" aria-hidden="true" />
    </button>
  )
})
