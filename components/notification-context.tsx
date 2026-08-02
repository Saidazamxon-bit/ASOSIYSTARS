'use client'

import * as React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, AlertTriangle, Clock3, Info, X } from 'lucide-react'

export type NotificationVariant = 'success' | 'error' | 'warning' | 'info'

export type NotificationItem = {
  id: string
  title: string
  description?: string
  emoji?: string
  color?: string
  variant?: NotificationVariant
  time: string
}

type NotificationsContextValue = {
  addNotification: (
    title: string,
    description?: string,
    opts?: { emoji?: string; color?: string; variant?: NotificationVariant }
  ) => void
}

const NotificationsContext = React.createContext<NotificationsContextValue | null>(null)

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<NotificationItem[]>([])

  const removeNotification = React.useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const addNotification = React.useCallback(
    (
      title: string,
      description?: string,
      opts?: { emoji?: string; color?: string; variant?: NotificationVariant }
    ) => {
      const id = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : String(Date.now())

      const now = new Date()
      const time = now.toLocaleTimeString('uz-UZ', {
        hour: '2-digit',
        minute: '2-digit',
      })

      const newItem: NotificationItem = {
        id,
        title,
        description,
        emoji: opts?.emoji,
        color: opts?.color,
        variant: opts?.variant,
        time,
      }

      setItems((prev) => [newItem, ...prev].slice(0, 4))

      window.setTimeout(() => {
        setItems((prev) => prev.filter((item) => item.id !== id))
      }, 5000)
    },
    [],
  )

  const value = React.useMemo(() => ({ addNotification }), [addNotification])

  return (
    <NotificationsContext.Provider value={value}>
      {children}
      <NotificationStack items={items} onDismiss={removeNotification} />
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const ctx = React.useContext(NotificationsContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider')
  return ctx
}

// Har bir variant uchun tayyor uslub — ikonka, ranglar (loyihaning mavjud
// "success"/"destructive"/"gold" ranglariga mos keladi).
const VARIANT_STYLES: Record<
  NotificationVariant,
  { Icon: typeof CheckCircle2; border: string; tint: string; iconWrap: string; iconColor: string }
> = {
  success: {
    Icon: CheckCircle2,
    border: 'border-success/40',
    tint: 'bg-success/10',
    iconWrap: 'bg-success/15',
    iconColor: 'text-success',
  },
  error: {
    Icon: AlertTriangle,
    border: 'border-destructive/40',
    tint: 'bg-destructive/10',
    iconWrap: 'bg-destructive/15',
    iconColor: 'text-destructive',
  },
  warning: {
    Icon: Clock3,
    border: 'border-gold/40',
    tint: 'bg-gold/10',
    iconWrap: 'bg-gold/15',
    iconColor: 'text-gold',
  },
  info: {
    Icon: Info,
    border: 'border-sky-400/40',
    tint: 'bg-sky-400/10',
    iconWrap: 'bg-sky-400/15',
    iconColor: 'text-sky-400',
  },
}

function NotificationStack({
  items,
  onDismiss,
}: {
  items: NotificationItem[]
  onDismiss: (id: string) => void
}) {
  return (
    <div
      className="pointer-events-none fixed right-2 z-[100] flex w-[calc(100vw-32px)] max-w-[260px] flex-col gap-2 sm:right-4 sm:max-w-[280px]"
      style={{ top: 'max(0.75rem, env(safe-area-inset-top, 0px))' }}
    >
      <AnimatePresence initial={false}>
        {items.map((item) => {
          const style = item.variant ? VARIANT_STYLES[item.variant] : null
          const Icon = style?.Icon

          return (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: -14, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className={`group pointer-events-auto relative overflow-hidden rounded-xl border p-2.5 pr-7 shadow-xl shadow-black/30 backdrop-blur-xl ${
                style ? `${style.border} ${style.tint}` : 'border-border bg-slate-950/95'
              }`}
              style={!style && item.color ? { borderColor: item.color } : undefined}
            >
              <div className="flex items-start gap-2">
                <div
                  className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg text-sm ${
                    style ? style.iconWrap : 'bg-white/5'
                  }`}
                >
                  {style && Icon ? (
                    <Icon className={`size-3.5 ${style.iconColor}`} strokeWidth={2.2} aria-hidden="true" />
                  ) : (
                    <span>{item.emoji ?? '✨'}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center justify-between gap-1.5">
                    <p className="truncate text-[13px] font-semibold text-white">{item.title}</p>
                    <span className="shrink-0 text-[9px] text-slate-400">{item.time}</span>
                  </div>
                  {item.description ? (
                    <p className="line-clamp-2 text-[11px] leading-snug text-slate-300">{item.description}</p>
                  ) : null}
                </div>
              </div>

              <button
                type="button"
                onClick={() => onDismiss(item.id)}
                aria-label="Yopish"
                data-disable-sound="true"
                className={`absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded-md border opacity-40 transition-opacity hover:opacity-100 ${
                  style ? `${style.border} ${style.iconColor}` : 'border-border text-slate-400'
                }`}
              >
                <X className="size-3" strokeWidth={2.2} aria-hidden="true" />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
