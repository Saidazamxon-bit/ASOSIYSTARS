"use client"

type SettingsState = {
  language: string
  theme: string
  currency: string
  timezone: string
  sound?: string
  buttonSound: boolean
  interfaceSound: boolean
  fontSize: string
  fontFamily: string
  boldText: boolean
  accentColor: string
  animationSpeed: string
}

const KEY = 'ultra:settings'
const CLOUD_KEY = 'settings'

export const loadSettings = (): SettingsState | null => {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  } catch (e) {
    return null
  }
}

export const saveSettings = (s: SettingsState) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(s))
  } catch (e) {}
}

function resolveSystemTheme(autoDarkMode: boolean) {
  const tg = (window as any).Telegram?.WebApp
  const scheme = tg?.colorScheme
  if (scheme === 'dark' || scheme === 'light') return scheme
  if (autoDarkMode) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'light'
}

export function applyTheme(theme: string, autoDarkMode = false) {
  const root = document.documentElement
  const resolved = theme === 'system' ? resolveSystemTheme(true) : theme
  root.setAttribute('data-theme', resolved)
  if (theme === 'amoled') {
    document.body.classList.add('amoled-theme')
  } else {
    document.body.classList.remove('amoled-theme')
  }
}

export function applyAccent(accent: string) {
  const root = document.documentElement
  let accentColor = 'oklch(0.55 0.24 295)'
  let accentForeground = 'oklch(0.98 0.005 280)'

  switch (accent) {
    case 'Aqua':
      accentColor = '#22d3ee'
      accentForeground = '#ffffff'
      break
    case 'Purple':
      accentColor = '#8b5cf6'
      accentForeground = '#f8f7ff'
      break
    case 'Rose':
      accentColor = '#f43f5e'
      accentForeground = '#ffffff'
      break
    case 'Emerald':
      accentColor = '#10b981'
      accentForeground = '#ffffff'
      break
    case 'Blue':
    default:
      accentColor = '#0ea5e9'
      accentForeground = '#ffffff'
      break
  }

  root.style.setProperty('--accent', accentColor)
  root.style.setProperty('--accent-foreground', accentForeground)
}

export function applyAccessibility(opts?: { largeText?: boolean; highContrast?: boolean; reduceMotion?: boolean }) {
  const root = document.documentElement
  if (opts?.largeText) root.classList.add('large-text')
  else root.classList.remove('large-text')

  if (opts?.highContrast) root.classList.add('high-contrast')
  else root.classList.remove('high-contrast')

  if (opts?.reduceMotion) root.classList.add('reduce-motion')
  else root.classList.remove('reduce-motion')
}

export function applyTypography(options: {
  fontSize: string
  fontFamily: string
  boldText: boolean
  animationSpeed: string
  performanceMode: string
}) {
  const root = document.documentElement
  const body = document.body

  const sizeMap: Record<string, string> = {
    Small: '0.9rem',
    Medium: '1rem',
    Large: '1.08rem',
    XL: '1.16rem',
  }

  const familyMap: Record<string, string> = {
    Default: 'var(--font-sans)',
    Sans: 'system-ui, sans-serif',
    Serif: 'Georgia, serif',
    Mono: 'var(--font-mono)',
  }

  root.style.setProperty('--app-font-size', sizeMap[options.fontSize] || '1rem')
  body.style.fontFamily = familyMap[options.fontFamily] || 'var(--font-sans)'
  root.classList.toggle('bold-text', options.boldText)
  root.classList.remove('animation-speed-slow', 'animation-speed-normal', 'animation-speed-fast')
  root.classList.add(`animation-speed-${options.animationSpeed.toLowerCase()}`)
  root.classList.remove('performance-balanced', 'performance-performance', 'performance-battery')
  root.classList.add(`performance-${options.performanceMode}`)
}

export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('/sw.js')
      return true
    } catch (e) {
      return false
    }
  }
  return false
}

export async function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    const regs = await navigator.serviceWorker.getRegistrations()
    await Promise.all(regs.map((r) => r.unregister()))
    return true
  }
  return false
}

// Telegram's Mini App SDK exposes CloudStorage.setItem/getItem (callback
// style), not .set/.get. Promisify the real methods so callers can just await.
function tgCloudSetItem(tg: any, key: string, value: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    tg.CloudStorage.setItem(key, value, (error: any, success: boolean) => {
      if (error) reject(error)
      else resolve(!!success)
    })
  })
}

function tgCloudGetItem(tg: any, key: string): Promise<string | null> {
  return new Promise((resolve, reject) => {
    tg.CloudStorage.getItem(key, (error: any, value: string) => {
      if (error) reject(error)
      else resolve(value || null)
    })
  })
}

export async function syncToCloud(settings: SettingsState) {
  // Try Telegram WebApp CloudStorage if available
  try {
    const tg = (window as any).Telegram?.WebApp
    if (tg?.CloudStorage && typeof tg.CloudStorage.setItem === 'function') {
      await tgCloudSetItem(tg, CLOUD_KEY, JSON.stringify(settings))
      return { ok: true }
    }
  } catch (e) {
    // ignore and fallback to backend
  }

  // Fallback to backend API
  try {
    const res = await fetch('/api/sync', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(settings) })
    return await res.json()
  } catch (e) {
    return { ok: false, error: String(e) }
  }
}

export async function hydrateFromCloud(): Promise<SettingsState | null> {
  try {
    const tg = (window as any).Telegram?.WebApp
    if (tg?.CloudStorage && typeof tg.CloudStorage.getItem === 'function') {
      const raw = await tgCloudGetItem(tg, CLOUD_KEY)
      if (raw) return JSON.parse(raw)
    }
  } catch (e) {
    // ignore and fallback to backend
  }

  try {
    const res = await fetch('/api/sync')
    if (res.ok) {
      const data = await res.json()
      return data?.settings ?? null
    }
  } catch (e) {}
  return null
}

export function downloadJSON(data: any, filename = 'ultra-settings.json') {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function playClickSound(preset: string | undefined, volume = 1) {
  if (!preset || preset === 'off') return
  const selected = ['modern', 'asmr', 'default'].includes(preset) ? preset : 'default'
  try {
    const audio = new Audio(`/sounds/${selected}.mp3`)
    audio.preload = 'auto'
    audio.volume = Math.max(0, Math.min(1, volume))
    audio.currentTime = 0
    void audio.play()
  } catch (e) {
    // ignore playback errors
  }
}

export function initClickSoundHandler() {
  const getCurrentSettings = () => {
    const settings = loadSettings()
    return settings
  }

  const handler = (ev: PointerEvent) => {
    try {
      const target = ev.target as HTMLElement | null
      if (!target) return
      const el = target.closest && (target.closest('button, [role="button"], a[href], [data-sound]') as HTMLElement | null)
      if (!el) return
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') return
      if (el.closest && el.closest('[data-disable-sound="true"]')) return

      const settings = getCurrentSettings()
      if (!settings) return
      if (el.tagName === 'BUTTON' && !settings.buttonSound) return
      if (el.tagName !== 'BUTTON' && !settings.interfaceSound) return
      const current = settings.sound || 'modern'
      if (current === 'off') return
          const volume = 0.7
      playClickSound(current, volume)
    } catch (e) {
      // ignore
    }
  }

  document.addEventListener('pointerdown', handler, { capture: true })

  return () => {
    document.removeEventListener('pointerdown', handler, { capture: true } as any)
  }
}
