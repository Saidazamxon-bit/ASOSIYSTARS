'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

type RippleButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  rippleColor?: string
}

export function RippleButton({
  className,
  children,
  rippleColor = 'rgba(255,255,255,0.18)',
  onPointerDown,
  type,
  style,
  ...props
}: RippleButtonProps) {
  const [rippleKey, setRippleKey] = React.useState(0)

  const handlePointerDown = React.useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      setRippleKey((value) => value + 1)
      if (onPointerDown) onPointerDown(event)
    },
    [onPointerDown],
  )

  return (
    <button
      {...props}
      type={type ?? 'button'}
      className={cn('ripple-button relative overflow-hidden', className)}
      style={{ ...style, '--ripple-color': rippleColor } as React.CSSProperties}
      data-ripple-key={rippleKey}
      onPointerDown={handlePointerDown}
    >
      {children}
    </button>
  )
}
