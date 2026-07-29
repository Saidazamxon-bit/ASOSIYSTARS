'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import {
  loadSettings as loadLocalSettings,
  saveSettings as saveLocalSettings,
  syncToCloud as syncToCloudBackend,
  applyTheme as applyThemeBase,
  applyAccent as applyAccentBase,
  applyAccessibility as applyAccessibilityBase,
  applyTypography as applyTypographyBase,
} from './settings-client'
import manager from './languageManager'
import { applyThemeVars } from './theme-manager'

export type SettingsState = {
  language: 'uz' | 'en' | 'ru'
  theme: 'system' | 'light' | 'dark' | 'amoled' | 'default' | 'retro' | 'cyberpunk' | 'valentine' | 'aqua'
  currency: 'UZS' | 'USD' | 'RUB' | 'EUR' | 'Stars'
  timezone: 'UTC' | 'Asia/Tashkent' | 'Europe/Moscow'
  sound: 'modern' | 'asmr' | 'default' | 'off'
  buttonSound: boolean
  interfaceSound: boolean
  fontSize: 'Small' | 'Medium' | 'Large' | 'XL'
  fontFamily: 'Default' | 'Sans' | 'Serif' | 'Mono'
  boldText: boolean
  accentColor: 'Blue' | 'Aqua' | 'Purple' | 'Rose' | 'Emerald'
  animationSpeed: 'Normal' | 'Fast' | 'Slow'
  animationMode: 'Off' | 'Minimal' | 'Normal' | 'Premium' | 'Ultra'
}

export const DEFAULT_SETTINGS: SettingsState = {
  language: 'uz',
  theme: 'default',
  currency: 'UZS',
  timezone: 'UTC',
  sound: 'modern',
  buttonSound: true,
  interfaceSound: true,
  fontSize: 'Medium',
  fontFamily: 'Default',
  boldText: false,
  accentColor: 'Blue',
  animationSpeed: 'Normal',
  animationMode: 'Premium',
}

const STAR_RATE = 220
const USD_RATE = 0.000089

type SettingsContextValue = {
  settings: SettingsState
  ready: boolean
  syncing: boolean
  showTwoFAModal: boolean
  openTwoFAModal: () => void
  closeTwoFAModal: () => void
  updateSettings: (patch: Partial<SettingsState>) => void
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined)

function normalizeSettings(value: any): SettingsState {
  if (!value || typeof value !== 'object') return DEFAULT_SETTINGS

  const normalizedTheme = typeof value.theme === 'string' && ['default', 'retro', 'cyberpunk', 'valentine', 'aqua', 'amoled', 'system'].includes(value.theme)
    ? value.theme
    : DEFAULT_SETTINGS.theme

  return {
    ...DEFAULT_SETTINGS,
    ...value,
    theme: normalizedTheme,
  }
}

export function formatCurrency(amount: number, currency: string): string {
  if (currency === 'Stars') return `${Math.round(amount / STAR_RATE)}`
  if (currency === 'USD') return `$${(amount * USD_RATE).toFixed(2)}`
  if (currency === 'RUB') return `₽${Math.round(amount * 0.0097)}`
  if (currency === 'EUR') return `€${(amount * 0.000082).toFixed(2)}`
  return `${String(Math.round(amount)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}`
}

export function formatDate(date: Date, timezone: string): string {
  const formatter = new Intl.DateTimeFormat('uz-UZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: timezone,
  })
  return formatter.format(date)
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS)
  const [ready, setReady] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [showTwoFAModal, setShowTwoFAModal] = useState(false)
  const syncTimerRef = useRef<number | null>(null)
  const settingsRef = useRef<SettingsState>(DEFAULT_SETTINGS)

  useEffect(() => {
    const local = loadLocalSettings()
    const normalized = normalizeSettings(local)
    setSettings(normalized)
    settingsRef.current = normalized
    void manager.setLanguage(normalized.language)
    applyThemeBase(normalized.theme)
    applyAccessibilityBase(normalized)
    applyAccentBase(normalized.accentColor)
    applyTypographyBase(normalized)
    // apply granular CSS variables for theme-driven UI
    try { applyThemeVars(normalized.theme) } catch (e) {}
    setReady(true)
  }, [])

  useEffect(() => {
    settingsRef.current = settings
  }, [settings])

  const scheduleSync = useCallback(() => {
    if (syncTimerRef.current) {
      window.clearTimeout(syncTimerRef.current)
    }
    syncTimerRef.current = window.setTimeout(() => {
      void syncToCloudBackend(settingsRef.current)
      syncTimerRef.current = null
    }, 800)
  }, [])

  const updateSettings = useCallback((patch: Partial<SettingsState>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch }
      saveLocalSettings(next)
      if (patch.language) {
        void manager.setLanguage(patch.language)
      }
      applyThemeBase(next.theme)
      applyAccessibilityBase(next)
      applyAccentBase(next.accentColor)
      applyTypographyBase(next)
      try { applyThemeVars(next.theme) } catch (e) {}
      scheduleSync()
      return next
    })
  }, [scheduleSync])

  const value = useMemo(
    () => ({
      settings,
      ready,
      syncing,
      showTwoFAModal,
      openTwoFAModal: () => setShowTwoFAModal(true),
      closeTwoFAModal: () => setShowTwoFAModal(false),
      updateSettings,
    }),
    [settings, ready, syncing, showTwoFAModal, updateSettings],
  )

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useAppSettings() {
  const context = useContext(SettingsContext)
  if (!context) throw new Error('useAppSettings must be used within SettingsProvider')
  return context
}
