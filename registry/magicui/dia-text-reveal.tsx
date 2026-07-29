'use client'

import { motion } from 'framer-motion'

type DiaTextRevealProps = {
  text: string
  colors?: string[]
  className?: string
}

export function DiaTextReveal({
  text,
  colors = ['#A97CF8', '#F38CB8', '#FDCC92'],
  className,
}: DiaTextRevealProps) {
  const gradient = `linear-gradient(90deg, ${colors.join(', ')})`

  return (
    <h1
      className={className}
      style={{
        backgroundImage: gradient,
        WebkitBackgroundClip: 'text',
        color: 'transparent',
        whiteSpace: 'pre',
      }}
    >
      {text.split('').map((char, index) => (
        <motion.span
          key={`${char}-${index}`}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.03, duration: 0.28, ease: 'easeOut' }}
          style={{ display: 'inline-block' }}
        >
          {char}
        </motion.span>
      ))}
    </h1>
  )
}
