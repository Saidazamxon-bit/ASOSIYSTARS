'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Settings, HelpCircle } from 'lucide-react'
import { useTranslation } from '@/lib/languageManager'

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  username?: string
}

export function ProfileModal({ isOpen, onClose, username = 'User' }: ProfileModalProps) {
  const { t } = useTranslation() as any
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            role="button"
            data-disable-sound="true"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-28 right-3 z-50 w-64 rounded-2xl bg-gradient-to-br from-slate-900/95 via-slate-950/95 to-black/95 p-4 shadow-2xl"
            style={{
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-pink-500">
                  <span className="text-sm font-bold text-white">{username.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{username}</p>
                  <p className="text-xs text-gray-400">{t('profile.vip')}</p>
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                data-disable-sound="true"
                className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="h-4 w-4 text-gray-400" />
              </motion.button>
            </div>

            {/* Divider */}
            <div className="mb-3 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* Menu Items */}
            <div className="space-y-2">
              <motion.button
                whileHover={{ x: 4 }}
                className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-white/5 transition-colors"
              >
                <User className="h-4 w-4 text-violet-400" />
                <span>{t('page.profile')}</span>
              </motion.button>

              <motion.button
                whileHover={{ x: 4 }}
                className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-white/5 transition-colors"
              >
                <Settings className="h-4 w-4 text-blue-400" />
                <span>{t('profile.menu.settings')}</span>
              </motion.button>

              <a
                href="https://t.me/StarPayerSupportBot"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full block"
              >
                <motion.div
                  whileHover={{ x: 4 }}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-white/5 transition-colors"
                >
                  <HelpCircle className="h-4 w-4 text-green-400" />
                  <span>{t('profile.menu.help')}</span>
                </motion.div>
              </a>

              {/* Divider */}
              <div className="my-2 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>

            {/* Footer */}
            <div className="mt-4 border-t border-white/10 pt-3">
              <p className="text-xs text-gray-500 text-center">v1.0.0 • Built with ❤️</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
