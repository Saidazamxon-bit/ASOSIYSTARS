"use client"

import React from 'react'
import { useTranslation } from '@/lib/languageManager'

export function LanguageSwitcher({ value, onChange }: { value?: string; onChange?: (lang: string) => void }) {
  const { t, lang, setLanguage } = useTranslation() as any

  const handle = (l: string) => {
    setLanguage(l)
    if (onChange) onChange(l)
  }

  return (
    <div className="flex items-center gap-3">
      <label className={`flex items-center gap-2 cursor-pointer ${lang === 'uz' ? 'font-semibold' : ''}`}>
        <input type="radio" name="app-lang" checked={lang === 'uz'} onChange={() => handle('uz')} />
        <span>{t('language.uz')}</span>
      </label>

      <label className={`flex items-center gap-2 cursor-pointer ${lang === 'en' ? 'font-semibold' : ''}`}>
        <input type="radio" name="app-lang" checked={lang === 'en'} onChange={() => handle('en')} />
        <span>{t('language.en')}</span>
      </label>

      <label className={`flex items-center gap-2 cursor-pointer ${lang === 'ru' ? 'font-semibold' : ''}`}>
        <input type="radio" name="app-lang" checked={lang === 'ru'} onChange={() => handle('ru')} />
        <span>{t('language.ru')}</span>
      </label>
    </div>
  )
}

export default LanguageSwitcher
