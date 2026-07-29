// Server-only module: imported exclusively from app/api/admin/* route
// handlers, never from client components.
// ---------------------------------------------------------------------------
// Dev-grade in-memory admin data store.
//
// The real backend (backend/src/modules/admin) has no implementation yet
// (`AdminModule` is an empty stub) and this Next.js app has no database
// connection of its own. Rather than leaving the admin panel as a static
// mock with buttons that do nothing, this module gives it a real, working
// data layer for local development: seeded data, real mutations, real
// pagination/search, and an audit trail that actually records what admins do.
//
// Field names intentionally mirror backend/src/database/schema.sql (users,
// wallets, transactions, audit_logs) so swapping this for TypeORM repositories
// later is a matter of replacing the functions below, not the API contract.
// ---------------------------------------------------------------------------

export type UserStatus = 'active' | 'suspended' | 'banned'

export type AdminUser = {
  id: number
  telegramId: string
  username: string
  displayName: string
  language: string
  vipLevel: number
  status: UserStatus
  riskScore: number
  currency: string
  balance: number
  frozenBalance: number
  createdAt: string
  updatedAt: string
}

export type AdminTransaction = {
  id: number
  userId: number
  amount: number
  currency: string
  type:
    | 'deposit'
    | 'withdraw'
    | 'purchase'
    | 'refund'
    | 'reward'
    | 'referral_bonus'
    | 'case_opening'
    | 'item_sell'
    | 'admin_adjustment'
    | 'chargeback'
  status: 'pending' | 'completed' | 'failed' | 'reversed'
  reason?: string
  createdAt: string
}

export type AuditLog = {
  id: number
  actor: string
  targetType: string
  targetId: number
  action: string
  oldValue?: unknown
  newValue?: unknown
  createdAt: string
}

type Store = {
  users: AdminUser[]
  transactions: AdminTransaction[]
  auditLogs: AuditLog[]
  nextUserId: number
  nextTxId: number
  nextAuditId: number
}

const NAMES = [
  'javohir_uz', 'madina_star', 'shohruh07', 'dilnoza_k', 'otabek_pro',
  'sitora_vip', 'jasur_99', 'nigora_a', 'bekzod_x', 'zarina_m',
  'aziz_khan', 'kamola_b', 'islom_dev', 'nodira_s', 'rustam_v',
]

function seed(): Store {
  const now = Date.now()
  const users: AdminUser[] = NAMES.map((username, i) => {
    const statusRoll = i % 11
    const status: UserStatus = statusRoll === 0 ? 'banned' : statusRoll === 1 ? 'suspended' : 'active'
    return {
      id: i + 1,
      telegramId: String(100000000 + i * 7919),
      username,
      displayName: username.split('_')[0].replace(/^./, (c) => c.toUpperCase()),
      language: ['uz', 'ru', 'en'][i % 3],
      vipLevel: i % 5,
      status,
      riskScore: Math.round(((i * 37) % 100) * 10) / 10,
      currency: 'UZS',
      balance: Math.round(((i + 1) * 48123.5 + (i % 4) * 10000) * 100) / 100,
      frozenBalance: i % 6 === 0 ? 15000 : 0,
      createdAt: new Date(now - (i + 3) * 86400000).toISOString(),
      updatedAt: new Date(now - i * 3600000).toISOString(),
    }
  })

  const transactions: AdminTransaction[] = []
  let txId = 1
  users.forEach((user, i) => {
    const count = 2 + (i % 3)
    for (let k = 0; k < count; k++) {
      const types: AdminTransaction['type'][] = ['deposit', 'case_opening', 'reward', 'purchase', 'referral_bonus']
      transactions.push({
        id: txId++,
        userId: user.id,
        amount: Math.round((500 + ((i * 13 + k * 91) % 9000)) * 100) / 100,
        currency: 'UZS',
        type: types[(i + k) % types.length],
        status: 'completed',
        reason: undefined,
        createdAt: new Date(now - (k + 1) * 3600000 - i * 1800000).toISOString(),
      })
    }
  })

  return {
    users,
    transactions,
    auditLogs: [
      {
        id: 1,
        actor: 'system',
        targetType: 'system',
        targetId: 0,
        action: 'seed',
        createdAt: new Date(now - 7 * 86400000).toISOString(),
      },
    ],
    nextUserId: users.length + 1,
    nextTxId: txId,
    nextAuditId: 2,
  }
}

// Survives across route handler invocations within the same server process
// (module-level singleton), same pattern used by app/api/sessions/route.ts.
const globalForStore = globalThis as unknown as { __adminStore?: Store }
export const store: Store = globalForStore.__adminStore ?? (globalForStore.__adminStore = seed())

export function listUsers(opts: { query?: string; status?: UserStatus | 'all'; page?: number; pageSize?: number }) {
  const { query = '', status = 'all', page = 1, pageSize = 8 } = opts
  const q = query.trim().toLowerCase()
  let rows = store.users
  if (q) {
    rows = rows.filter(
      (u) => u.username.toLowerCase().includes(q) || u.displayName.toLowerCase().includes(q) || u.telegramId.includes(q),
    )
  }
  if (status !== 'all') {
    rows = rows.filter((u) => u.status === status)
  }
  rows = [...rows].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
  const total = rows.length
  const start = (page - 1) * pageSize
  const pageRows = rows.slice(start, start + pageSize)
  return { rows: pageRows, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) }
}

export function getUser(id: number) {
  return store.users.find((u) => u.id === id) ?? null
}

export function getUserTransactions(id: number) {
  return store.transactions.filter((t) => t.userId === id).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
}

export function updateUser(id: number, patch: Partial<Pick<AdminUser, 'status' | 'vipLevel' | 'displayName'>>, actor = 'admin') {
  const user = store.users.find((u) => u.id === id)
  if (!user) return null
  const oldValue = { status: user.status, vipLevel: user.vipLevel, displayName: user.displayName }
  if (patch.status !== undefined) user.status = patch.status
  if (patch.vipLevel !== undefined) user.vipLevel = Math.max(0, Math.min(10, patch.vipLevel))
  if (patch.displayName !== undefined) user.displayName = patch.displayName
  user.updatedAt = new Date().toISOString()
  addAuditLog({ actor, targetType: 'user', targetId: id, action: 'update_user', oldValue, newValue: patch })
  return user
}

export function adjustBalance(id: number, amount: number, reason: string, actor = 'admin') {
  const user = store.users.find((u) => u.id === id)
  if (!user) return null
  const oldBalance = user.balance
  const newBalance = Math.round((user.balance + amount) * 100) / 100
  if (newBalance < 0) return { error: 'insufficient_balance' as const }
  user.balance = newBalance
  user.updatedAt = new Date().toISOString()

  const tx: AdminTransaction = {
    id: store.nextTxId++,
    userId: id,
    amount: Math.abs(amount),
    currency: user.currency,
    type: 'admin_adjustment',
    status: 'completed',
    reason,
    createdAt: new Date().toISOString(),
  }
  store.transactions.unshift(tx)
  addAuditLog({
    actor,
    targetType: 'wallet',
    targetId: id,
    action: amount >= 0 ? 'credit_balance' : 'debit_balance',
    oldValue: { balance: oldBalance },
    newValue: { balance: newBalance, amount, reason },
  })
  return { user, tx }
}

export function listTransactions(opts: { userId?: number; type?: string; page?: number; pageSize?: number }) {
  const { userId, type, page = 1, pageSize = 10 } = opts
  let rows = [...store.transactions].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  if (userId) rows = rows.filter((t) => t.userId === userId)
  if (type && type !== 'all') rows = rows.filter((t) => t.type === type)
  const total = rows.length
  const start = (page - 1) * pageSize
  const pageRows = rows.slice(start, start + pageSize)
  return { rows: pageRows, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) }
}

export function addAuditLog(entry: Omit<AuditLog, 'id' | 'createdAt'>) {
  const log: AuditLog = { ...entry, id: store.nextAuditId++, createdAt: new Date().toISOString() }
  store.auditLogs.unshift(log)
  return log
}

export function listAuditLogs(opts: { page?: number; pageSize?: number }) {
  const { page = 1, pageSize = 10 } = opts
  const total = store.auditLogs.length
  const start = (page - 1) * pageSize
  const rows = store.auditLogs.slice(start, start + pageSize)
  return { rows, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) }
}

export type LeaderboardPeriod = 'today' | 'week' | 'month' | 'all'

export type LeaderboardEntry = {
  rank: number
  userId: number
  username: string
  displayName: string
  vipLevel: number
  amount: number
}

function periodStart(period: LeaderboardPeriod): number {
  const now = new Date()
  if (period === 'all') return 0
  if (period === 'today') {
    const d = new Date(now)
    d.setHours(0, 0, 0, 0)
    return d.getTime()
  }
  if (period === 'week') {
    const d = new Date(now)
    const day = d.getDay() === 0 ? 7 : d.getDay() // Monday-start week
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - (day - 1))
    return d.getTime()
  }
  // month
  const d = new Date(now.getFullYear(), now.getMonth(), 1)
  return d.getTime()
}

// Real leaderboard computed from the same in-memory transaction ledger that
// powers /api/admin/transactions — ranks users by total money deposited
// ("eng koʻp pul solgan") within the given time window.
export function getLeaderboard(period: LeaderboardPeriod = 'all', limit = 10): LeaderboardEntry[] {
  const since = periodStart(period)
  const totals = new Map<number, number>()
  for (const tx of store.transactions) {
    if (tx.type !== 'deposit' || tx.status !== 'completed') continue
    if (new Date(tx.createdAt).getTime() < since) continue
    totals.set(tx.userId, (totals.get(tx.userId) ?? 0) + tx.amount)
  }
  const rows = Array.from(totals.entries())
    .map(([userId, amount]) => {
      const user = store.users.find((u) => u.id === userId)
      return {
        userId,
        username: user?.username ?? `user_${userId}`,
        displayName: user?.displayName ?? `User ${userId}`,
        vipLevel: user?.vipLevel ?? 0,
        amount: Math.round(amount * 100) / 100,
      }
    })
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit)
    .map((row, i) => ({ rank: i + 1, ...row }))
  return rows
}

export function getStats() {
  const users = store.users
  const totalUsers = users.length
  const activeUsers = users.filter((u) => u.status === 'active').length
  const suspendedUsers = users.filter((u) => u.status === 'suspended').length
  const bannedUsers = users.filter((u) => u.status === 'banned').length
  const totalBalance = Math.round(users.reduce((sum, u) => sum + u.balance, 0) * 100) / 100
  const dayAgo = Date.now() - 86400000
  const transactions24h = store.transactions.filter((t) => new Date(t.createdAt).getTime() >= dayAgo)
  const volume24h = Math.round(transactions24h.reduce((sum, t) => sum + t.amount, 0) * 100) / 100
  const highRiskUsers = users.filter((u) => u.riskScore >= 70).length
  return {
    totalUsers,
    activeUsers,
    suspendedUsers,
    bannedUsers,
    totalBalance,
    transactions24h: transactions24h.length,
    volume24h,
    highRiskUsers,
  }
}
