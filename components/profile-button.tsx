'use client'

import { motion } from 'framer-motion'
import { useTranslation } from '@/lib/languageManager'

interface ProfileButtonProps {
  username?: string
  onClick?: () => void
}

export function ProfileButton({ username = 'User', onClick }: ProfileButtonProps) {
  const { t } = useTranslation() as any
  const initials = username
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.1 }}
      className="fixed right-3 top-3 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 shadow-xl shadow-purple-500/40 transition-all hover:shadow-2xl hover:shadow-purple-500/60 border border-purple-400/30"
      title={`${t('page.profile')}: ${username}`}
      aria-label={`${t('page.profile')}: ${username}`}
    >
      <span className="text-base font-bold text-white drop-shadow-md">{initials}</span>
    </motion.button>
  )
}
