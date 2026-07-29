"use client"

import React from 'react'
import manager from '@/lib/languageManager'

export default function LanguageInit() {
  React.useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        await manager.init()
        if (!mounted) return
        manager.translatePage()
      } catch (e) {}
    })()
    return () => {
      mounted = false
    }
  }, [])

  return null
}
