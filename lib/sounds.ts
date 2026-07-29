"use client"

import { loadSettings } from './settings-client'

const validPresets = ['modern', 'asmr', 'default'] as const

type SoundPreset = (typeof validPresets)[number]

export function playClickSound(preset: string | undefined, volume = 0.7) {
  if (!preset || preset === 'off') return
  const selected = validPresets.includes(preset as SoundPreset) ? (preset as SoundPreset) : 'default'
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

// Play small UI event sounds (success, error, click, notify, insufficient)
export function playUIEvent(eventName: string, overrideVolume?: number) {
  try {
    const settings = loadSettings()
    // event -> preset mapping
    const map: Record<string, string> = {
      click: settings?.sound || 'modern',
      success: 'default',
      error: 'asmr',
      insufficient: 'asmr',
      notify: 'modern',
    }
    const preset = map[eventName] || 'default'
    const vol = typeof overrideVolume === 'number' ? overrideVolume : 0.7
    playClickSound(preset, vol)
  } catch (e) {
    // ignore
  }
}

// Try to prime audio playback so future `Audio.play()` calls aren't blocked by
// autoplay policies. This does not play any audible sound — it creates a
// short silent buffer via the WebAudio API and starts/stops it on a user
// gesture. Safe to call multiple times.
export function primeAudio() {
  try {
    const win = window as any
    const AudioCtx = win.AudioContext || win.webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    // create a 1-frame silent buffer
    const buffer = ctx.createBuffer(1, 1, ctx.sampleRate)
    const src = ctx.createBufferSource()
    src.buffer = buffer
    src.connect(ctx.destination)
    src.start(0)
    src.stop(0)
    // resume context if suspended
    if (ctx.state === 'suspended' && typeof ctx.resume === 'function') void ctx.resume()
  } catch (e) {
    // ignore
  }
}

export function initClickSoundHandler() {
  const getCurrentSound = () => {
    const settings = loadSettings()
    return settings?.sound || 'modern'
  }

  const handler = (ev: PointerEvent) => {
    try {
      const target = ev.target as HTMLElement | null
      if (!target) return
      const el = target.closest && (target.closest('button, [role="button"], a[href], [data-sound]') as HTMLElement | null)
      if (!el) return
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') return
      if (el.closest && el.closest('[data-disable-sound="true"]')) return
      const current = getCurrentSound()
      if (current === 'off') return
      playClickSound(current)
    } catch (e) {
      // ignore
    }
  }

  document.addEventListener('pointerdown', handler, { capture: true })

  return () => {
    document.removeEventListener('pointerdown', handler, { capture: true } as any)
  }
}
