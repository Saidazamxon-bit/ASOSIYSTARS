// Server-only: proxies the Next.js /api/admin/* routes to the REAL PHP
// backend's admin API (api/admin/*.php), which reads/writes the actual
// MySQL database. This replaces the old in-memory mock (`admin-store.ts`,
// randomly seeded fake users like "javohir_uz") that never reflected real
// purchases — that's why Stars/Premium orders never showed up in the
// Next.js /admin dashboard even after they existed in the real database.
//
// Auth: the PHP endpoints are gated by require_admin_api(), which accepts
// `Authorization: Bearer <ADMIN_API_TOKEN>`. That token lives only here,
// on the server — never sent to the browser.

const PHP_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://6a4cc7f182c08.xvest2.ru').replace(/\/$/, '')
const ADMIN_API_TOKEN = process.env.PHP_ADMIN_API_TOKEN || 'Saidazam'

export class PhpAdminError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export async function phpAdminFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${PHP_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ADMIN_API_TOKEN}`,
      ...(options.headers as Record<string, string> | undefined),
    },
    cache: 'no-store',
  })

  const data = await res.json().catch(() => null)

  if (!res.ok || !data || data.ok === false) {
    const message = (data && (data.error || data.message)) || `PHP admin API xatosi (${res.status})`
    throw new PhpAdminError(String(message), res.status || 500)
  }

  return data as Record<string, any>
}
