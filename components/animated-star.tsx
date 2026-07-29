'use client'

import { useMemo, type CSSProperties } from 'react'
import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import { useAppSettings } from '@/lib/application-settings'

export type StarVariant = 'gold' | 'premium'

type VariantConfig = {
  src: string
  alt: string
  glow: string
  glowSoft: string
  particle: string
  rotateSign: 1 | -1
}

const VARIANTS: Record<StarVariant, VariantConfig> = {
  gold: {
    src: '/images/stars/star-gold.png',
    alt: 'Telegram Stars',
    glow: 'rgba(255,213,74,0.55)',
    glowSoft: 'rgba(255,179,0,0.2)',
    particle: 'rgba(255,224,130,0.95)',
    rotateSign: -1,
  },
  premium: {
    src: '/images/stars/star-premium.png',
    alt: 'Telegram Premium',
    glow: 'rgba(139,92,246,0.55)',
    glowSoft: 'rgba(56,189,248,0.22)',
    particle: 'rgba(196,181,253,0.95)',
    rotateSign: 1,
  },
}

// animationMode already exists app-wide (Settings page). AnimatedStar is the
// first component to honor every tier instead of a flat on/off switch, so
// the same hero graphic stays smooth on older Android devices (Minimal),
// looks great by default (Premium — the app's own default mode) and gets
// the full treatment for people who opt into Ultra.
type Tier = 'off' | 'minimal' | 'normal' | 'premium' | 'ultra'

function useStarTier(): Tier {
  const { settings } = useAppSettings()
  const reduced = useReducedMotion()
  if (reduced) return 'off'
  switch (settings.animationMode) {
    case 'Off':
      return 'off'
    case 'Minimal':
      return 'minimal'
    case 'Normal':
      return 'normal'
    case 'Ultra':
      return 'ultra'
    case 'Premium':
    default:
      return 'premium'
  }
}

export function AnimatedStar({
  variant,
  size = 112,
  interactive = true,
  className = '',
  onClick,
}: {
  variant: StarVariant
  size?: number
  interactive?: boolean
  className?: string
  onClick?: () => void
}) {
  const tier = useStarTier()
  const v = VARIANTS[variant]

  const floats = tier !== 'off'
  const showGlow = tier !== 'off'
  const showShine = tier === 'premium' || tier === 'ultra'
  const showSparkle = tier === 'premium' || tier === 'ultra'
  const showOrbit = tier === 'ultra'
  const showDust = tier === 'ultra'

  const orbitDots = useMemo(
    () => [
      { r: Math.round(size * 0.62), dur: 9, dot: 5, delay: 0 },
      { r: Math.round(size * 0.8), dur: 13, dot: 4, delay: -4 },
      { r: Math.round(size * 0.46), dur: 7.5, dot: 3.5, delay: -2 },
    ],
    [size],
  )

  const dustDots = useMemo(
    () => [
      { left: '20%', delay: 0, dur: 4.2 },
      { left: '76%', delay: 1.1, dur: 4.8 },
      { left: '48%', delay: 2.2, dur: 4.4 },
    ],
    [],
  )

  return (
    <motion.div
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={onClick}
      onDragStart={(e) => e.preventDefault()}
      whileHover={interactive && floats ? { scale: 1.06 } : undefined}
      whileTap={interactive && floats ? { scale: 0.93 } : undefined}
      className={`relative flex shrink-0 items-center justify-center outline-none select-none ${interactive ? 'cursor-pointer' : ''} ${className}`}
      style={{ width: size, height: size }}
      aria-label={v.alt}
    >
      {/* Ambient glow */}
      {showGlow && (
        <span
          aria-hidden
          className="pulse-glow absolute rounded-full"
          style={{
            width: size * 1.7,
            height: size * 1.7,
            background: `radial-gradient(circle, ${v.glow} 0%, ${v.glowSoft} 42%, transparent 72%)`,
            filter: `blur(${Math.max(10, Math.round(size * 0.14))}px)`,
          }}
        />
      )}

      {/* Orbiting sparks — Ultra only */}
      {showOrbit &&
        orbitDots.map((dot, i) => (
          <span
            key={i}
            aria-hidden
            className="star-orbit-dot absolute rounded-full"
            style={
              {
                width: dot.dot,
                height: dot.dot,
                background: v.particle,
                boxShadow: `0 0 8px ${v.glow}`,
                '--orbit-r': `${dot.r}px`,
                animationDuration: `${dot.dur}s`,
                animationDelay: `${dot.delay}s`,
              } as CSSProperties
            }
          />
        ))}

      {/* Rising sparkle dust — Ultra only */}
      {showDust &&
        dustDots.map((d, i) => (
          <span
            key={i}
            aria-hidden
            className="star-dust absolute rounded-full"
            style={{
              left: d.left,
              bottom: '14%',
              width: 3,
              height: 3,
              background: v.particle,
              animationDuration: `${d.dur}s`,
              animationDelay: `${d.delay}s`,
            }}
          />
        ))}

      {/* The star artwork itself: float + gentle breathing */}
      <motion.div
        animate={
          floats
            ? {
                y: [0, -7, 0],
                rotate: [0, 3 * v.rotateSign, 0],
                scale: [1, 1.035, 1],
              }
            : undefined
        }
        transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
        className="relative"
        style={{ width: size * 0.82, height: size * 0.82 }}
      >
        <Image
          src={v.src}
          alt={v.alt}
          fill
          draggable={false}
          sizes={`${size}px`}
          className="object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.35)] select-none pointer-events-none"
        />

        {/* Shine sweep, masked to the star's own silhouette so light only
            crosses the star shape rather than a square bounding box. */}
        {showShine && (
          <span
            aria-hidden
            className="star-shine absolute inset-0"
            style={{
              maskImage: `url(${v.src})`,
              WebkitMaskImage: `url(${v.src})`,
              maskSize: 'contain',
              WebkitMaskSize: 'contain',
              maskRepeat: 'no-repeat',
              WebkitMaskRepeat: 'no-repeat',
              maskPosition: 'center',
              WebkitMaskPosition: 'center',
            }}
          />
        )}

        {/* Twinkle accents — Premium and Ultra */}
        {showSparkle && (
          <>
            <span
              aria-hidden
              className="star-twinkle absolute -right-1 -top-1 text-[11px] leading-none"
              style={{ color: v.particle }}
            >
              ✦
            </span>
            <span
              aria-hidden
              className="star-twinkle absolute -left-2 bottom-3 text-[8px] leading-none"
              style={{ color: v.particle, animationDelay: '1.1s' }}
            >
              ✦
            </span>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}
