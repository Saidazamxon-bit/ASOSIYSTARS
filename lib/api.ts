'use client'

// PHP backend qayerda joylashgan bo'lsa, shu yerga to'liq manzilni yozing
// (masalan https://yourdomain.com). .env.local faylida:
// NEXT_PUBLIC_API_BASE_URL=https://yourdomain.com
const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '')

function getInitData(): string {
  if (typeof window === 'undefined') return ''
  // @ts-expect-error Telegram WebApp SDK global
  return window.Telegram?.WebApp?.initData || ''
}

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const initData = getInitData()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  }
  console.log('initData:', initData)
  headers['X-Telegram-Init-Data'] = initData

  try {
    const res = await fetch(`${API_BASE}${path}`, { cache: 'no-store', ...options, headers })

    let data: any = null
    try {
      data = await res.json()
    } catch (parseError) {
      console.warn('apiFetch failed to parse JSON response', { path, status: res.status, statusText: res.statusText, parseError })
      data = null
    }

    if (!res.ok || !data || data.ok === false) {
      const remoteError = data?.error ?? data?.message ?? data
      const remoteMessage = typeof remoteError === 'string'
        ? remoteError
        : remoteError && typeof remoteError === 'object'
        ? JSON.stringify(remoteError)
        : undefined

      const statusMessage = res.statusText || `HTTP ${res.status}`
      const defaultMessage = `So'rovda xatolik (${res.status})`
      const message =
        res.status === 401 || res.status === 403
          ? `Telegram auth failed (${res.status}). Iltimos, ilovani Telegram ichida oching.`
          : remoteMessage
          ? `${remoteMessage} (${statusMessage})`
          : defaultMessage

      console.error('apiFetch error response', {
        path,
        status: res.status,
        statusText: res.statusText,
        body: data,
        initData: initData ? `${initData.slice(0, 20)}...` : 'missing',
      })

      throw new ApiError(message, res.status)
    }

    return data
  } catch (error) {
    if (error instanceof ApiError) throw error
    const errorString = String(error)
    console.error('apiFetch network/error', { path, error, initData })
    throw new ApiError(`Tarmoq xatosi: ${errorString}`, 0)
  }
}

export const api = {
  me: () => apiFetch('/api/me.php'),
  transactions: (page = 1) => apiFetch(`/api/transactions.php?page=${page}&pageSize=30`),
  topupInfo: () => apiFetch('/api/topup.php'),
  requestTopUp: (amount: number) =>
    apiFetch('/api/topup.php', { method: 'POST', body: JSON.stringify({ amount }) }),
  topupStatus: (id: number) => apiFetch(`/api/topup_status.php?id=${id}`),
  createOrder: (payload: Record<string, unknown>) =>
    apiFetch('/api/orders.php', { method: 'POST', body: JSON.stringify(payload) }),
  orders: (page = 1) => apiFetch(`/api/orders.php?page=${page}`),
  catalog: () => apiFetch('/api/catalog.php'),
  leaderboard: (period: 'today' | 'week' | 'month' | 'all' = 'all') =>
    apiFetch(`/api/leaderboard.php?period=${period}`),
}
