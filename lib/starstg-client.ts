// Frontend client for StarsPaymee Partner Purchase API
// All actual API calls go through backend routes for security

export interface StarsPaymeeError {
  success: false
  error: string
  retry_after?: number
}

export interface PurchaseStarsRequest {
  username: string
  stars: number
  idempotency_key: string
}

export interface PurchasePremiumRequest {
  username: string
  months: 3 | 6 | 12
  idempotency_key: string
}

export interface PurchaseResponse {
  success: boolean
  order_id: number
  idempotency_key?: string
  product_type: 'stars' | 'premium'
  username: string
  amount: number
  stars?: number
  months?: number
  usdt_charged: number
  status: 'processing' | 'completed' | 'failed'
  transaction_id?: string
  error?: string
  balance_remaining_usdt: number
  created_at: string
  completed_at?: string
}

export interface BalanceResponse {
  success: boolean
  balance_usdt: number
  currency: string
}

export interface PricingResponse {
  success: boolean
  stars: {
    min: number
    max: number
    usdt_per_star: number
  }
  premium: {
    months: number[]
    usdt: Record<string, number>
  }
  payment_method: string
}

export interface SearchResponse {
  success: boolean
  found: {
    myself: boolean
    name: string
    photo?: string
    recipient: string
    premium?: boolean | null
  }
}

export interface HealthResponse {
  success: boolean
  fragment_ready: boolean
  api_configured: boolean
  version: string
}

const API_BASE = '/api/starstg'

async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || `API error: ${response.status}`)
  }

  return response.json()
}

export const starstgClient = {
  async health(): Promise<HealthResponse> {
    return apiFetch('/health')
  },

  async balance(): Promise<BalanceResponse> {
    return apiFetch('/balance')
  },

  async pricing(): Promise<PricingResponse> {
    return apiFetch('/pricing')
  },

  async search(productType: string, query: string, quantity?: number, months?: number): Promise<SearchResponse> {
    const params = new URLSearchParams({ product_type: productType, query })
    if (quantity) params.append('quantity', String(quantity))
    if (months) params.append('months', String(months))
    return apiFetch(`/search?${params.toString()}`)
  },

  async purchaseStars(req: PurchaseStarsRequest): Promise<PurchaseResponse> {
    return apiFetch('/purchase-stars', {
      method: 'POST',
      body: JSON.stringify(req),
    })
  },

  async purchasePremium(req: PurchasePremiumRequest): Promise<PurchaseResponse> {
    return apiFetch('/purchase-premium', {
      method: 'POST',
      body: JSON.stringify(req),
    })
  },
}

/**
 * purchase-stars / purchase-premium javobi "processing" bo'lsa, haqiqiy
 * natija ma'lum bo'lguncha shu yordamchi bilan kutamiz — shu orqali
 * "loadingdan keyin darhol tushdi deb chiqib, keyin balans qaytib qolish"
 * muammosi oldini oladi: yakuniy holat aniq bo'lgunga qadar hech narsa
 * "yetkazildi" deb ko'rsatilmaydi.
 */
export async function pollStarstgOrderStatus(
  orderId: number | string,
  { attempts = 15, intervalMs = 3000 }: { attempts?: number; intervalMs?: number } = {},
): Promise<'completed' | 'failed'> {
  for (let i = 0; i < attempts; i++) {
    await new Promise((resolve) => setTimeout(resolve, intervalMs))
    try {
      const res = await fetch(`/api/starstg/order-status?order_id=${encodeURIComponent(String(orderId))}`, {
        cache: 'no-store',
      })
      const data = await res.json().catch(() => null)
      const status = data?.status
      if (status === 'completed') return 'completed'
      if (status === 'failed') return 'failed'
      // status === 'processing' bo'lsa — davom etamiz
    } catch {
      // vaqtincha tarmoq xatosi — keyingi urinishda davom etamiz
    }
  }
  // Belgilangan urinishlar tugadi — natija noaniq, xavfsiz tomonga
  // (pulni qaytarish) og'amiz, "tushdi" deb yolg'on ko'rsatmaymiz.
  return 'failed'
}
