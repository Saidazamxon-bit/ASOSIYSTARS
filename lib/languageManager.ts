import translations from './translations'

type Lang = 'uz' | 'en' | 'ru'

const STORAGE_KEY = 'app_lang'

class LanguageManager extends EventTarget {
  lang: Lang = 'uz'

  constructor() {
    super()
  }

  async init() {
    // Try Telegram Cloud Storage
    try {
      // @ts-ignore
      const webapp = (window as any).Telegram?.WebApp
      if (webapp && webapp.CloudStorage && typeof webapp.CloudStorage.getItem === 'function') {
        // some hosts return Promise, others callback-based; try promise first
        try {
          // @ts-ignore
          const val = await webapp.CloudStorage.getItem(STORAGE_KEY)
          if (val) {
            this.setLanguage(this.normalize(val))
            return this.lang
          }
        } catch (e) {
          // fallback: callback style
          try {
            await new Promise((resolve) => {
              // @ts-ignore
              webapp.CloudStorage.getItem(STORAGE_KEY, (res: any) => {
                if (res) this.setLanguage(this.normalize(res))
                resolve(null)
              })
            })
            return this.lang
          } catch (e2) {
            // ignore
          }
        }
      }
    } catch (e) {}

    // Try localStorage
    try {
      const local = localStorage.getItem(STORAGE_KEY)
      if (local) {
        this.setLanguage(this.normalize(local))
        return this.lang
      }
    } catch (e) {}

    // Try Telegram user's language code
    try {
      // @ts-ignore
      const webapp = (window as any).Telegram?.WebApp
      const code = webapp?.initDataUnsafe?.user?.language_code
      if (code) {
        this.setLanguage(this.mapCode(code))
        return this.lang
      }
    } catch (e) {}

    // default
    this.setLanguage('uz')
    return this.lang
  }

  normalize(v: any): Lang {
    const s = String(v).toLowerCase()
    if (s.startsWith('ru')) return 'ru'
    if (s.startsWith('en')) return 'en'
    if (s.startsWith('uz')) return 'uz'
    // fallback: if unknown, default to uz
    return 'uz'
  }

  mapCode(code: string): Lang {
    const c = code.toLowerCase()
    if (c === 'ru' || c.startsWith('ru')) return 'ru'
    if (c === 'en' || c.startsWith('en')) return 'en'
    if (c === 'uz' || c.startsWith('uz')) return 'uz'
    // some users use 'uz_latn' etc.
    if (c.includes('uz')) return 'uz'
    if (c.includes('ru')) return 'ru'
    if (c.includes('en')) return 'en'
    return 'uz'
  }

  getLanguage() {
    return this.lang
  }

  async setLanguage(lang: Lang) {
    this.lang = this.normalize(lang) as Lang
    document.documentElement.lang = this.lang
    // persist localStorage
    try {
      localStorage.setItem(STORAGE_KEY, this.lang)
    } catch (e) {}
    // persist Telegram Cloud if available
    try {
      // @ts-ignore
      const webapp = (window as any).Telegram?.WebApp
      if (webapp && webapp.CloudStorage && typeof webapp.CloudStorage.setItem === 'function') {
        try {
          // @ts-ignore
          const r = await webapp.CloudStorage.setItem(STORAGE_KEY, this.lang)
          // some implementations may return value or promise; ignore result
        } catch (e) {
          // callback-style fallback
          try {
            // @ts-ignore
            webapp.CloudStorage.setItem(STORAGE_KEY, this.lang, () => {})
          } catch (e2) {}
        }
      }
    } catch (e) {}

    // notify listeners
    this.dispatchEvent(new CustomEvent('languagechange', { detail: this.lang }))
    // update DOM text for elements that use data-i18n
    this.translatePage()
  }

  t(key: string, params?: Record<string, string | number>) {
    const current = (translations as any)[this.lang] || {}
    const fallback = (translations as any).en?.[key] ?? (translations as any).uz?.[key] ?? key
    let text = current[key] ?? fallback
    if (params && typeof text === 'string') {
      Object.keys(params).forEach((paramKey) => {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(params[paramKey]))
      })
    }
    return text
  }

  translatePage(root: Document | HTMLElement = document) {
    try {
      const elems = Array.from(root.querySelectorAll('[data-i18n]'))
      elems.forEach((el: Element) => {
        const key = el.getAttribute('data-i18n') || ''
        const text = this.t(key)
        // special handling for inputs/placeholders
        if ((el as HTMLInputElement).placeholder !== undefined && el.hasAttribute('data-i18n-placeholder')) {
          ;(el as HTMLInputElement).placeholder = text
        } else if ((el as HTMLInputElement).value !== undefined && el.hasAttribute('data-i18n-value')) {
          ;(el as HTMLInputElement).value = text
        } else {
          el.textContent = text
        }
      })
    } catch (e) {
      // ignore
    }
  }

  // For React usage: simple subscription
  onChange(cb: (lang: Lang) => void) {
    const handler = (e: Event) => cb((e as CustomEvent).detail)
    this.addEventListener('languagechange', handler as EventListener)
    return () => this.removeEventListener('languagechange', handler as EventListener)
  }
}

const manager = new LanguageManager()

export default manager

// Reactive convenience for React components
export function useTranslation() {
  // avoid importing React here at top to keep module simple; lazy import in function
  // caller is expected to use in a client component
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const React = require('react')
  const { useState, useEffect } = React
  const [lang, setLang] = useState<Lang>(manager.getLanguage())
  useEffect(() => {
    const unsub = manager.onChange((l) => setLang(l))
    // also initialize manager once
    if (manager.getLanguage() === undefined) {
      ;(async () => {
        await manager.init()
        setLang(manager.getLanguage())
      })()
    }
    return unsub
  }, [])

  return {
    t: (k: string, params?: Record<string, string | number>) => manager.t(k, params),
    lang,
    setLanguage: (l: Lang) => manager.setLanguage(l),
    manager,
  }
}
