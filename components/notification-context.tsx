'use client'

import * as React from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export type NotificationItem = {
  id: string
  title: string
  description?: string
  emoji?: string
  color?: string
  time: string
}

type NotificationsContextValue = {
  addNotification: (
    title: string,
    description?: string,
    opts?: { emoji?: string; color?: string }
  ) => void
}

const NotificationsContext = React.createContext<NotificationsContextValue | null>(null)

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<NotificationItem[]>([])

  const addNotification = React.useCallback(
    (
      title: string,
      description?: string,
      opts?: { emoji?: string; color?: string }
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
        emoji: opts?.emoji ?? '✨',
        color: opts?.color ?? '#22c55e',
        time,
      }

      setItems((prev) => [newItem, ...prev].slice(0, 4))

      window.setTimeout(() => {
        setItems((prev) => prev.filter((item) => item.id !== id))
      }, 4200)
    },
    [],
  )

  const value = React.useMemo(() => ({ addNotification }), [addNotification])

  return (
    <NotificationsContext.Provider value={value}>
      {children}
      <NotificationStack items={items} />
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const ctx = React.useContext(NotificationsContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider')
  return ctx
}

function NotificationStack({ items }: { items: NotificationItem[] }) {
  return (
    <div className="pointer-events-none fixed right-4 top-24 z-[100] flex w-full max-w-sm flex-col gap-3 px-2">
      <AnimatePresence initial={false}>
        {items.map((item) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, x: 20, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.98 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="pointer-events-auto overflow-hidden rounded-3xl border bg-slate-950/95 p-3 shadow-2xl shadow-black/20 backdrop-blur-xl"
            style={{ borderColor: item.color }}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 text-lg">
                {item.emoji}
              </div>
              <div className="min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-semibold text-white">{item.title}</p>
                  <span className="text-[11px] text-slate-400">{item.time}</span>
                </div>
                {item.description ? (
                  <p className="truncate text-xs text-slate-300">{item.description}</p>
                ) : null}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
