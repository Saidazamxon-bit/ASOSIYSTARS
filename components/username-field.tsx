'use client'

import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { AlertCircle, CheckCircle2, Sparkles } from 'lucide-react'
import { useAppSettings } from '@/lib/application-settings'

type UsernameFieldProps = {
  value: string
  onChange: (v: string) => void
  accent: 'gold' | 'violet'
  currentUsername?: string
}

const accentThemes = {
  gold: {
    accent: '#FFD54A',
    border: '#FFB300',
    glow: 'rgba(255,213,74,0.24)',
    text: '#FFF9E5',
    buttonText: '#1F1A05',
  },
  violet: {
    accent: '#8B5CF6',
    border: '#7C3AED',
    glow: 'rgba(139,92,246,0.22)',
    text: '#F3E8FF',
    buttonText: '#FFFFFF',
  },
}

export function UsernameField({ value, onChange, accent, currentUsername }: UsernameFieldProps) {
  const { settings } = useAppSettings()
  const [touched, setTouched] = useState(false)
  const [selfWarning, setSelfWarning] = useState('')
  const reduced = useReducedMotion()
  const ready = value.trim().length >= 3
  const invalid = touched && !ready && value.trim().length > 0
  const mode = reduced ? 'Off' : settings.animationMode
  const useMotion = mode !== 'Off'
  const theme = accentThemes[accent]

  useEffect(() => {
    if (!value.trim()) setTouched(false)
  }, [value])

  useEffect(() => {
    if (currentUsername?.trim().length >= 3) {
      setSelfWarning('')
    }
  }, [currentUsername])

  const handleSelfClick = () => {
    const trimmed = currentUsername?.trim()
    if (trimmed && trimmed.length >= 3) {
      onChange(trimmed)
      setTouched(true)
      setSelfWarning('')
    } else {
      setSelfWarning('Iltimos, foydalanuvchi nomini qo‘ying.')
    }
  }

  return (
    <section aria-label="Telegram foydalanuvchi nomi" className="rounded-[28px] border border-white/10 bg-[#11131A]/92 p-3 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/45">Telegram username</h2>
          <p className="mt-1 text-xs text-white/55">Enter the recipient username to send Stars or Premium.</p>
        </div>
        <motion.button
          type="button"
          whileTap={useMotion ? { scale: 0.96 } : undefined}
          onClick={handleSelfClick}
          className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white"
          style={{
            color: '#ffffff',
            borderColor: theme.border,
            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.08), 0 0 18px ${theme.glow}`,
          }}
        >
          O&apos;zimga
        </motion.button>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <motion.div
          animate={invalid && useMotion ? { x: [0, -4, 4, -3, 3, 0] } : undefined}
          transition={{ duration: 0.24 }}
          className="relative flex-1"
        >
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: theme.accent }} aria-hidden="true">
            @
          </span>
          <input
            value={value}
            onChange={(e) => onChange(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
            onBlur={() => setTouched(true)}
            placeholder="username"
            className="w-full rounded-[20px] border bg-black/20 py-3.5 pl-9 pr-4 text-sm text-white/90 placeholder:text-white/40 outline-none transition-all duration-200"
            style={{
              borderColor: theme.border,
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
              color: theme.text,
            }}
            aria-label="Telegram username"
          />
          <div className="pointer-events-none absolute inset-0 rounded-[20px]" style={{ boxShadow: `0 0 0 1px ${theme.glow}` }} />
        </motion.div>

        <motion.div
          animate={useMotion ? { scale: ready ? 1 : 0.97, opacity: ready ? 1 : 0.72 } : undefined}
          className={`flex items-center gap-1.5 rounded-[18px] px-3 py-2 text-[11px] font-semibold ${ready ? 'bg-emerald-400/12 text-emerald-300' : 'bg-white/6 text-white/60'}`}
        >
          {ready ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
          {ready ? 'Ready' : 'Input'}
        </motion.div>
      </div>

      {invalid ? (
        <motion.div
          initial={useMotion ? { opacity: 0, y: -4 } : undefined}
          animate={useMotion ? { opacity: 1, y: 0 } : undefined}
          className="mt-2 flex items-center gap-2 rounded-[16px] border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-[11px] text-rose-200"
        >
          <AlertCircle className="h-3.5 w-3.5" />
          Username must be at least 3 characters.
        </motion.div>
      ) : null}

      {selfWarning ? (
        <motion.div
          initial={useMotion ? { opacity: 0, y: -4 } : undefined}
          animate={useMotion ? { opacity: 1, y: 0 } : undefined}
          className="mt-2 flex items-center gap-2 rounded-[16px] border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-[11px] text-rose-200"
        >
          <AlertCircle className="h-3.5 w-3.5" />
          {selfWarning}
        </motion.div>
      ) : null}
    </section>
  )
}
