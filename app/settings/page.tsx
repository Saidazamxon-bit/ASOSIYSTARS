'use client'

import { useEffect, useState } from 'react'
import { DEFAULT_SETTINGS, SettingsState, useAppSettings } from '@/lib/application-settings'
import { useNotifications } from '@/components/notification-context'

const languageOptions = [
  { value: 'uz', label: "O'zbekcha" },
  { value: 'en', label: 'English' },
  { value: 'ru', label: 'Русский' },
]

const timezoneOptions = [
  { value: 'UTC', label: 'UTC' },
  { value: 'Asia/Tashkent', label: 'Asia/Tashkent' },
  { value: 'Europe/Moscow', label: 'Europe/Moscow' },
]

const themeOptions = [
  {
    value: 'default',
    label: 'Default',
    palette: ['#111827', '#f8fafc', '#64748b'],
  },
  {
    value: 'retro',
    label: 'Retro',
    palette: ['#3f2f11', '#d6b47a', '#f8e7c2'],
  },
  {
    value: 'cyberpunk',
    label: 'Cyberpunk',
    palette: ['#0f172a', '#7c3aed', '#22d3ee'],
  },
  {
    value: 'valentine',
    label: 'Valentine',
    palette: ['#221425', '#f9c0d9', '#f43f5e'],
  },
  {
    value: 'aqua',
    label: 'Aqua',
    palette: ['#032f44', '#7dd3fc', '#38bdf8'],
  },
]

const accentColors = ['Blue', 'Aqua', 'Purple', 'Rose', 'Emerald'] as const
const animationSpeeds = ['Slow', 'Normal', 'Fast'] as const
const animationModes = ['Off', 'Minimal', 'Normal', 'Premium', 'Ultra'] as const

export default function SettingsPage() {
  const { settings, updateSettings, ready } = useAppSettings()
  const { addNotification } = useNotifications()
  const [toast, setToast] = useState<string | null>(null)
  const [toastKey, setToastKey] = useState(0)

  useEffect(() => {
    if (!toast) return
    const timeout = window.setTimeout(() => setToast(null), 2400)
    return () => window.clearTimeout(timeout)
  }, [toast])

  const notify = (message: string) => {
    setToast(message)
    setToastKey((value) => value + 1)
  }

  const handleUpdate = (message: string, patch: Partial<SettingsState>) => {
    updateSettings(patch)
    notify(message)
    addNotification(message, 'Sozlamalar yangilandi', { variant: 'info' })
  }

  if (!ready) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 text-center text-sm text-slate-300">
        Sozlamalar yuklanmoqda...
      </div>
    )
  }

  return (
    <main className="settings-shell relative min-h-screen overflow-hidden pb-24">
      <div className="absolute inset-0 opacity-80">
        <div className="ultra-bg" />
        <div className="ultra-grid" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="page-header-card mb-6">
          <div className="page-header-inner">
            <div className="page-header-icon">⚙️</div>
            <div>
              <p className="page-subtitle">Sozlamalar</p>
              <h1 className="page-title">Ilova sozlamalari</h1>
              <p className="page-description">
                Tezkor til, valyuta, mavzu va tovush parametrlarini shu erdan boshqaring.
              </p>
            </div>
          </div>
        </section>

        <div className="settings-grid">
          <section className="setting-card">
            <div className="setting-card-header">
              <div className="setting-icon-circle">🌍</div>
              <div>
                <p className="setting-heading">Til</p>
                <p className="setting-note">Ilova tilini o‘zgartiring.</p>
              </div>
            </div>
            <div className="setting-card-body">
              <div className="setting-row">
                <div className="setting-value">
                  {languageOptions.find((item) => item.value === settings.language)?.label}
                </div>
                <div className="setting-control">
                  <select
                    value={settings.language}
                    onChange={(event) => handleUpdate('Til saqlandi', { language: event.target.value as SettingsState['language'] })}
                  >
                    {languageOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </section>

          <section className="setting-card">
            <div className="setting-card-header">
              <div className="setting-icon-circle">🎨</div>
              <div>
                <p className="setting-heading">Mavzu</p>
                <p className="setting-note">Ilova mavzusini tanlang.</p>
              </div>
            </div>
            <div className="setting-card-body grid gap-3 sm:grid-cols-2">
              {themeOptions.map((theme) => {
                const selected = settings.theme === theme.value
                return (
                  <button
                    key={theme.value}
                    type="button"
                    className={`theme-choice ${selected ? 'selected' : ''}`}
                    onClick={() => handleUpdate(`${theme.label} mavzusi o‘rnatildi`, { theme: theme.value as SettingsState['theme'] })}
                  >
                    <div className="theme-choice-swatch">
                      <span style={{ background: theme.palette[0] }} />
                      <span style={{ background: theme.palette[1] }} />
                      <span style={{ background: theme.palette[2] }} />
                    </div>
                    <span>{theme.label}</span>
                  </button>
                )
              })}
            </div>
          </section>

          <section className="setting-card">
            <div className="setting-card-header">
              <div className="setting-icon-circle">🕒</div>
              <div>
                <p className="setting-heading">Vaqt mintaqasi</p>
                <p className="setting-note">Ilova soatlariga mos vaqt zonasi.</p>
              </div>
            </div>
            <div className="setting-card-body">
              <div className="setting-row">
                <div className="setting-value">{settings.timezone}</div>
                <div className="setting-control">
                  <select
                    value={settings.timezone}
                    onChange={(event) => handleUpdate('Vaqt zonasi saqlandi', { timezone: event.target.value as SettingsState['timezone'] })}
                  >
                    {timezoneOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="setting-note-block">
                Hozirgi vaqt: {new Date().toLocaleString('uz-UZ', { timeZone: settings.timezone })}
              </div>
            </div>
          </section>

          <section className="setting-card">
            <div className="setting-card-header">
              <div className="setting-icon-circle">🔊</div>
              <div>
                <p className="setting-heading">Tugma ovozi</p>
                <p className="setting-note">Interaktiv tugmalar uchun tovush effektini yoqing.</p>
              </div>
            </div>
            <div className="setting-card-body">
              <div className="setting-row setting-row-switch">
                <span className="setting-value">{settings.buttonSound ? 'ON' : 'OFF'}</span>
                <button
                  type="button"
                  className={`neo-switch ${settings.buttonSound ? 'enabled' : ''}`}
                  onClick={() => handleUpdate(settings.buttonSound ? 'Tugma ovozi o‘chirildi' : 'Tugma ovozi yoqildi', { buttonSound: !settings.buttonSound })}
                >
                  <span className="neo-switch-thumb" />
                </button>
              </div>
              <div className="mt-3">
                <label className="text-xs text-muted-foreground">Tovush preset</label>
                <div className="mt-2 flex items-center gap-2">
                  <select
                    value={settings.sound}
                    onChange={(e) => handleUpdate('Tugma tovushi tanlandi', { sound: e.target.value as SettingsState['sound'] })}
                    className="rounded-xl border border-border bg-input px-3 py-2 text-sm text-foreground"
                  >
                    <option value="modern">Modern</option>
                    <option value="default">Default</option>
                    <option value="asmr">ASMR</option>
                    <option value="off">O'chirish</option>
                  </select>
                  <div className="text-sm text-muted-foreground">{settings.sound}</div>
                </div>
              </div>
            </div>
          </section>

          <section className="setting-card">
            <div className="setting-card-header">
              <div className="setting-icon-circle">🎵</div>
              <div>
                <p className="setting-heading">Interfeys ovozi</p>
                <p className="setting-note">UI hamda navigatsiya tovushlarini boshqaring.</p>
              </div>
            </div>
            <div className="setting-card-body">
              <div className="setting-row setting-row-switch">
                <span className="setting-value">{settings.interfaceSound ? 'ON' : 'OFF'}</span>
                <button
                  type="button"
                  className={`neo-switch ${settings.interfaceSound ? 'enabled' : ''}`}
                  onClick={() => handleUpdate(settings.interfaceSound ? 'Interfeys ovozi o‘chirildi' : 'Interfeys ovozi yoqildi', { interfaceSound: !settings.interfaceSound })}
                >
                  <span className="neo-switch-thumb" />
                </button>
              </div>
            </div>
          </section>

          <section className="setting-card">
            <div className="setting-card-header">
              <div className="setting-icon-circle">🌈</div>
              <div>
                <p className="setting-heading">Accent Color</p>
                <p className="setting-note">Ilova tarkibida asosiy rangni tanlang.</p>
              </div>
            </div>
            <div className="setting-card-body flex flex-wrap gap-3">
              {accentColors.map((accent) => (
                <button
                  key={accent}
                  type="button"
                  className={`accent-swatch ${settings.accentColor === accent ? 'selected' : ''}`}
                  style={{
                    background:
                      accent === 'Blue'
                        ? '#0ea5e9'
                        : accent === 'Aqua'
                        ? '#22d3ee'
                        : accent === 'Purple'
                        ? '#8b5cf6'
                        : accent === 'Rose'
                        ? '#f43f5e'
                        : '#10b981',
                  }}
                  onClick={() => handleUpdate(`${accent} rang tanlandi`, { accentColor: accent as SettingsState['accentColor'] })}
                />
              ))}
            </div>
          </section>

          <section className="setting-card">
            <div className="setting-card-header">
              <div className="setting-icon-circle">🎬</div>
              <div>
                <p className="setting-heading">Animations</p>
                <p className="setting-note">Animatsiya darajasini tanlang: OFF, Minimal, Premium va Ultra.</p>
              </div>
            </div>
            <div className="setting-card-body">
              <div className="setting-row">
                <span className="setting-value">{settings.animationMode}</span>
                <div className="setting-control">
                  <select
                    value={settings.animationMode}
                    onChange={(event) => handleUpdate('Animatsiya darajasi saqlandi', { animationMode: event.target.value as SettingsState['animationMode'] })}
                  >
                    {animationModes.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="setting-row mt-3">
                <span className="setting-value">{settings.animationSpeed}</span>
                <div className="setting-control">
                  <select
                    value={settings.animationSpeed}
                    onChange={(event) => handleUpdate('Animatsiya tezligi saqlandi', { animationSpeed: event.target.value as SettingsState['animationSpeed'] })}
                  >
                    {animationSpeeds.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </section>

          <section className="setting-card">
            <div className="setting-card-header">
              <div className="setting-icon-circle">🛠</div>
              <div>
                <p className="setting-heading">Sozlamalarni tiklash</p>
                <p className="setting-note">Barcha sozlamalarni boshlang‘ich qiymatga qaytaring.</p>
              </div>
            </div>
            <div className="setting-card-body">
              <button
                type="button"
                className="action-button primary w-full"
                onClick={() => {
                  updateSettings(DEFAULT_SETTINGS)
                  notify('Sozlamalar tiklandi')
                  addNotification('Sozlamalar tiklandi', 'Barcha sozlamalar tiklandi', {
                    variant: 'warning',
                  })
                }}
              >
                Reset Settings
              </button>
            </div>
          </section>
        </div>
      </div>

      {toast ? (
        <div className="toast-container">
          <div key={toastKey} className="toast-panel">
            {toast}
          </div>
        </div>
      ) : null}
    </main>
  )
}
