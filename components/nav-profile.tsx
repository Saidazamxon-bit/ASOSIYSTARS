'use client'

import { motion } from 'framer-motion'
import { useTranslation } from '@/lib/languageManager'

interface NavProfileProps {
  username?: string
}

export function NavProfile({ username = 'U' }: NavProfileProps) {
  const { t } = useTranslation() as any
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.88 }}
      whileHover={{ scale: 1.12 }}
      className="relative flex h-12 w-12 items-center justify-center rounded-full flex-shrink-0 transition-all duration-300 group"
      style={{
        background: 'linear-gradient(135deg, rgba(147, 112, 219, 0.85) 0%, rgba(139, 92, 246, 0.85) 50%, rgba(236, 72, 153, 0.85) 100%)',
        backdropFilter: 'blur(12px)',
        border: '1.5px solid rgba(255, 255, 255, 0.25)',
        boxShadow: '0 6px 20px rgba(147, 112, 219, 0.35), 0 0 2px rgba(255, 255, 255, 0.5) inset, 0 -1px 3px rgba(0, 0, 0, 0.1)',
      }}
      title={`${t('page.profile')}: ${username}`}
      aria-label={`${t('page.profile')}: ${username}`}
    >
      {/* Animated glow background */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(147, 112, 219, 0.25) 0%, transparent 70%)',
        }}
        animate={{
          opacity: [0.4, 0.8, 0.4],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Hover glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100"
        style={{
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%)',
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Profile initials */}
      <motion.span
        className="relative z-10 text-sm font-bold text-white drop-shadow-lg"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
      >
        {username}
      </motion.span>
    </motion.button>
  )
}
