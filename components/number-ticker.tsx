'use client'

import { useEffect, useState } from 'react'
import { useMotionValue, useSpring } from 'framer-motion'

type NumberTickerProps = {
  value: number
  className?: string
  formatter?: (value: number) => string
}

const defaultFormatter = (value: number) => {
  const rounded = Math.round(value)
  return String(rounded).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

export function NumberTicker({ value, className, formatter = defaultFormatter }: NumberTickerProps) {
  const motionValue = useMotionValue(0)
  const springValue = useSpring(motionValue, { stiffness: 140, damping: 24 })
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    motionValue.set(value)
  }, [value, motionValue])

  useEffect(() => {
    return springValue.on('change', (latest) => {
      setDisplayValue(Math.round(latest))
    })
  }, [springValue])

  return <span className={className}>{formatter(displayValue)}</span>
}
