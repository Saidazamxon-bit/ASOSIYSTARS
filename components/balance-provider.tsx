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

export type TopUpRequestInfo = {
  id: number
  amount: number
  cardNumber: string | null
  expiresAt: string | null
  status: 'pending' | 'approved' | 'rejected'
}

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
  totalDeposited?: number
  totalStars?: number
  referralCount?: number
}

type BalanceContextValue = {
  user: UserProfile | null
  balance: number
  loading: boolean
  authError: string | null
  history: HistoryEntry[]
  paymentInstructions: string
  isTopUpOpen: boolean
  /** amount berilsa — TopUpModal ochilganda shu summa avtomatik tanlab qo'yiladi (masalan yetmayotgan farq). */
  openTopUp: (amount?: number) => void
  closeTopUp: () => void
  /** Gift yetarli mablag' bo'lmagani uchun to'xtatilgan bo'lsa — to'lov tasdiqlangach davom ettirish uchun saqlanadi. */
  topUpAmountHint: number | null
  pendingResume: (() => void) | null
  setPendingResume: (fn: (() => void) | null) => void
  purchase: (details: PurchaseDetails) => Promise<ActionResult>
  topUpRequest: TopUpRequestInfo | null
  requestTopUp: (amount: number) => Promise<ActionResult>
  checkTopUpStatus: () => Promise<'pending' | 'approved' | 'rejected' | null>
  clearTopUpRequest: () => void
  refresh: () => Promise<void>
  /** Faqat balans yetarliligini tekshiradi, hech narsani o'zgartirmaydi. */
  spend: (amount: number) => boolean
}

const BalanceContext = createContext<BalanceContextValue | null>(null)

// Foydalanuvchi modal oynasini yopib qo'yса ham (yoki ilovani qayta ochsa ham),
// hali tasdiqlanmagan to'lov so'rovini "unutib qo'ymaslik" uchun saqlab turamiz.
const TOPUP_STORAGE_KEY = 'ultra:topup-request'
const TOPUP_POLL_INTERVAL_MS = 4000

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

  const [topUpRequest, setTopUpRequest] = useState<TopUpRequestInfo | null>(null)

  // Ilova ochilganda — agar oldin yopilmagan/hal bo'lmagan "pending" so'rov qolgan bo'lsa,
  // uni localStorage'dan tiklaymiz (masalan foydalanuvchi to'lov qilib, modalni yopib
  // yuborgan, keyin sahifani yangilagan bo'lsa ham — kuzatuv uzilib qolmaydi).
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem(TOPUP_STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as TopUpRequestInfo
      if (parsed && parsed.status === 'pending') {
        setTopUpRequest(parsed)
      } else {
        window.localStorage.removeItem(TOPUP_STORAGE_KEY)
      }
    } catch {
      // buzilgan qiymat bo'lsa — e'tiborsiz qoldiramiz
    }
  }, [])

  // topUpRequest o'zgarganda holatni saqlab boramiz (yoki tozalaymiz)
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      if (topUpRequest) {
        window.localStorage.setItem(TOPUP_STORAGE_KEY, JSON.stringify(topUpRequest))
      } else {
        window.localStorage.removeItem(TOPUP_STORAGE_KEY)
      }
    } catch {
      // localStorage yo'q/bloklangan bo'lsa ham ilova ishlashda davom etadi
    }
  }, [topUpRequest])

  const requestTopUp = useCallback(async (amount: number): Promise<ActionResult> => {
    try {
      const res = await api.requestTopUp(amount)
      setPaymentInstructions(res.paymentInstructions || paymentInstructions)
      if (res.request) {
        setTopUpRequest({
          id: res.request.id,
          amount: res.request.amount,
          cardNumber: res.request.cardNumber ?? null,
          expiresAt: res.request.expiresAt ?? null,
          status: res.request.status ?? 'pending',
        })
      }
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : String(err)
      return { success: false, error: errorMessage || "So'rov yuborilmadi" }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /** "Tekshirish" tugmasi bosilganda HAM, davriy polling uchun HAM ishlatiladi — natijani qaytaradi. */
  const checkTopUpStatus = useCallback(async (): Promise<'pending' | 'approved' | 'rejected' | null> => {
    if (!topUpRequest) return null
    try {
      const res = await api.topupStatus(topUpRequest.id)
      setTopUpRequest((prev) =>
        prev
          ? {
              ...prev,
              status: res.request.status,
              cardNumber: res.request.cardNumber ?? prev.cardNumber,
              expiresAt: res.request.expiresAt ?? prev.expiresAt,
            }
          : prev,
      )
      if (res.request.status === 'approved' && typeof res.balance === 'number') {
        setBalance(res.balance)
        refresh()
      }
      return res.request.status
    } catch {
      // Polling xatosi jim o'tkaziladi — keyingi urinishda davom etadi
      return null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topUpRequest?.id, refresh])

  // Fon rejimidagi tekshiruv: modal ochiq yoki yopiq bo'lishidan qat'iy nazar,
  // "pending" so'rov borligicha davom etamiz — shu orqali foydalanuvchi modalni
  // yopib qo'ysa ham (masalan "hali qabul qilinmadi" xabarini ko'rib), to'lov
  // keyinroq tasdiqlansa, buni albatta ushlab qolamiz va balans/holat yangilanadi.
  useEffect(() => {
    if (!topUpRequest || topUpRequest.status !== 'pending') return
    const id = setInterval(() => {
      checkTopUpStatus()
    }, TOPUP_POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [topUpRequest?.id, topUpRequest?.status, checkTopUpStatus])

  const clearTopUpRequest = useCallback(() => setTopUpRequest(null), [])

  /** Eski, o'qib bo'lmaydigan kod yo'llari uchun — mutatsiya qilmaydi. */
  const spend = useCallback((amount: number) => balance >= amount, [balance])

  const [topUpAmountHint, setTopUpAmountHint] = useState<number | null>(null)
  const [pendingResume, setPendingResumeState] = useState<(() => void) | null>(null)
  const setPendingResume = useCallback((fn: (() => void) | null) => setPendingResumeState(() => fn), [])

  const openTopUp = useCallback((amount?: number) => {
    setTopUpAmountHint(amount && amount > 0 ? Math.ceil(amount) : null)
    setIsTopUpOpen(true)
  }, [])
  const closeTopUp = useCallback(() => {
    // DIQQAT: bu yerda topUpRequest'ni tozalamaymiz — agar hali "pending" bo'lsa,
    // fon rejimidagi tekshiruv (yuqoridagi useEffect) davom etishi kerak, aks holda
    // foydalanuvchi modalni yopib yuborsa, keyinroq kelgan tasdiqlash "yo'qolib qoladi".
    setIsTopUpOpen(false)
  }, [])

  // To'lov tasdiqlangach (balans yetarli bo'lib qolganda) — to'xtatilgan xaridni
  // avtomatik davom ettiramiz (masalan gift sotib olishda username so'rash ekrani).
  useEffect(() => {
    if (!pendingResume) return
    if (topUpRequest && topUpRequest.status === 'approved') {
      setIsTopUpOpen(false)
      setTopUpAmountHint(null)
      const resume = pendingResume
      setPendingResumeState(null)
      resume()
    }
  }, [topUpRequest, pendingResume])

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
      topUpAmountHint,
      pendingResume,
      setPendingResume,
      purchase,
      topUpRequest,
      requestTopUp,
      checkTopUpStatus,
      clearTopUpRequest,
      refresh,
      spend,
    }),
    [
      user,
      balance,
      loading,
      authError,
      history,
      paymentInstructions,
      isTopUpOpen,
      openTopUp,
      closeTopUp,
      topUpAmountHint,
      pendingResume,
      setPendingResume,
      purchase,
      topUpRequest,
      requestTopUp,
      checkTopUpStatus,
      clearTopUpRequest,
      refresh,
      spend,
    ],
  )

  return <BalanceContext.Provider value={value}>{children}</BalanceContext.Provider>
}

export function useBalance() {
  const ctx = useContext(BalanceContext)
  if (!ctx) throw new Error('useBalance must be used within BalanceProvider')
  return ctx
}
