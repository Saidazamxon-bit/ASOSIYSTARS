'use client'

import { motion } from 'framer-motion'
import { Shield, X, Check } from 'lucide-react'
import { useState } from 'react'
import { useAppSettings } from '@/lib/application-settings'

export function TwoFactorModal() {
  const { showTwoFAModal, closeTwoFAModal } = useAppSettings()
  const [connected, setConnected] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  if (!showTwoFAModal) return null

  async function handleConnect() {
    setBusy(true)
    setError('')
    return window.setTimeout(() => {
      setConnected(true)
      setBusy(false)
    }, 800)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 px-4 backdrop-blur-sm"
      aria-modal="true"
      role="dialog"
      aria-label="Two-factor authentication"
    >
      <motion.div
        initial={{ y: 36, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-brand/10 text-violet-brand">
              <Shield className="size-6" aria-hidden="true" />
            </div>
            <h2 className="mt-4 text-2xl font-bold">2FA va xavfsizlik</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Telegram OAuth bilan ikki faktorli autentifikatsiya o‘rnatib, har bir qurilmani boshqaring.
            </p>
          </div>
          <button
            type="button"
            onClick={closeTwoFAModal}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-muted-foreground"
            aria-label="Yopish"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-6 space-y-4 text-sm text-foreground">
          {connected ? (
            <div className="rounded-3xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-emerald-600">
              <div className="flex items-center gap-2 font-semibold">
                <Check className="size-4" aria-hidden="true" />
                2FA yoqildi
              </div>
              <p className="mt-1 text-sm text-foreground/80">
                Hisobingizga qo‘shimcha xavfsizlik kalitlari ulanishi muvaffaqiyatli amalga oshirildi.
              </p>
            </div>
          ) : (
            <>
              <p>
                Telefoningiz va veb-telefoningiz uchun xavfsiz kanalni yoqing. Har bir kirish kodi Telegram OAuth orqali tasdiqlanadi.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={handleConnect}
                  disabled={busy}
                  className="rounded-2xl bg-violet-brand px-4 py-3 text-sm font-bold text-accent-foreground transition hover:bg-violet-brand/90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {busy ? 'Ulanmoqda...' : 'OAuth bilan ulash'}
                </button>
                <button
                  type="button"
                  onClick={() => setError('Iltimos, brauzeringizda Telegram OAuth uchun ijozatni tekshiring.')}
                  className="rounded-2xl border border-border bg-secondary px-4 py-3 text-sm font-bold text-foreground"
                >
                  Qo‘shimcha xavfsizlik kalitlari
                </button>
              </div>
              {error ? <p className="text-xs text-rose-400">{error}</p> : null}
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
