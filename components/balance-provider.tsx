'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api, ApiError } from '@/lib/api'

export type HistoryEntry = {
  id: string
  type: string
  product: string
  recipient?: string | null
  amount: number
  createdAt: string
}

export type PurchaseDetails = {
  category: 'stars' | 'premium' | 'nft_gift' | 'regular_gift'
  productKey?: string
  customStars?: number
  targetUsername?: string
  amount: number
  productName: string
}

export type ActionResult = { success: boolean; error?: string }

export type UserProfile = {
  id?: number
  telegramId?: number | string
  username?: string
  displayName?: string
  language?: string
  region?: string
  avatarUrl?: string
  premiumStatus?: string
  vipLevel?: number
  referralCode?: string
  balance?: number
  createdAt?: string
}

type BalanceContextValue = {
  user: UserProfile | null
  balance: number
  loading: boolean
  authError: string | null
  history: HistoryEntry[]
  paymentInstructions: string
  isTopUpOpen: boolean
  openTopUp: () => void
  closeTopUp: () => void
  purchase: (details: PurchaseDetails) => Promise<ActionResult>
  requestTopUp: (amount: number) => Promise<ActionResult>
  refresh: () => Promise<void>
  /** Faqat balans yetarliligini tekshiradi, hech narsani o'zgartirmaydi. */
  spend: (amount: number) => boolean
}

const BalanceContext = createContext<BalanceContextValue | null>(null)

export function formatUZS(amount: number) {
  return String(Math.round(amount)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

export function BalanceProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [balance, setBalance] = useState(0)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const [paymentInstructions, setPaymentInstructions] = useState('')
  const [isTopUpOpen, setIsTopUpOpen] = useState(false)

  const refresh = useCallback(async () => {
    try {
      const [meRes, txRes, topupRes] = await Promise.all([
        api.me(),
        api.transactions(1),
        api.topupInfo(),
      ])
      setUser(meRes.user)
      setBalance(meRes.user.balance)
      setHistory(txRes.rows)
      setPaymentInstructions(topupRes.paymentInstructions || '')
      setAuthError(null)
    } catch (err) {
      setUser(null)
      setHistory([])
      setBalance(0)
      setPaymentInstructions('')
      const errorMessage = err instanceof ApiError ? err.message : String(err)
      setAuthError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Telegram Mini App SDK tayyor ekanini bildiradi (initData shakllanishi uchun)
    // @ts-expect-error Telegram WebApp SDK global
    window.Telegram?.WebApp?.ready?.()
    // @ts-expect-error Telegram WebApp SDK global
    window.Telegram?.WebApp?.expand?.()
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const purchase = useCallback(
    async (details: PurchaseDetails): Promise<ActionResult> => {
      try {
        const res = await api.createOrder({
          category: details.category,
          productKey: details.productKey,
          customStars: details.customStars,
          targetUsername: details.targetUsername,
        })
        if (res.user) {
          setUser(res.user)
          setBalance(res.user.balance)
        }
        setHistory((prev) => [
          {
            id: `order-${res.order.id}`,
            type: details.category,
            product: res.order.productName,
            recipient: res.order.targetUsername,
            amount: res.order.amount,
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ])
        return { success: true }
      } catch (err) {
        return { success: false, error: err instanceof ApiError ? err.message : "Xarid amalga oshmadi" }
      }
    },
    [],
  )

  const requestTopUp = useCallback(async (amount: number): Promise<ActionResult> => {
    try {
      const res = await api.requestTopUp(amount)
      if (res.user) {
        setUser(res.user)
        setBalance(res.user.balance)
      }
      setPaymentInstructions(res.paymentInstructions || paymentInstructions)
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : String(err)
      return { success: false, error: errorMessage || "So'rov yuborilmadi" }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /** Eski, o'qib bo'lmaydigan kod yo'llari uchun — mutatsiya qilmaydi. */
  const spend = useCallback((amount: number) => balance >= amount, [balance])

  const openTopUp = useCallback(() => setIsTopUpOpen(true), [])
  const closeTopUp = useCallback(() => setIsTopUpOpen(false), [])

  const value = useMemo(
    () => ({
      user,
      balance,
      loading,
      authError,
      history,
      paymentInstructions,
      isTopUpOpen,
      openTopUp,
      closeTopUp,
      purchase,
      requestTopUp,
      refresh,
      spend,
    }),
    [user, balance, loading, authError, history, paymentInstructions, isTopUpOpen, openTopUp, closeTopUp, purchase, requestTopUp, refresh, spend],
  )

  return <BalanceContext.Provider value={value}>{children}</BalanceContext.Provider>
}

export function useBalance() {
  const ctx = useContext(BalanceContext)
  if (!ctx) throw new Error('useBalance must be used within BalanceProvider')
  return ctx
}
