import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import Script from 'next/script'
import { BalanceProvider } from '@/components/balance-provider'
import { SettingsProvider } from '@/lib/application-settings'
import { AppShell } from '@/components/app-shell'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  title: 'ULTRA Market — Telegram Stars, Premium va NFT Giftlar',
  description:
    'Telegram Stars, Premium obuna va NFT giftlarni eng qulay narxlarda xarid qiling. Tez, xavfsiz va ishonchli.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#12101c',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="uz" className={`bg-background ${geist.variable} ${geistMono.variable}`}>
      <head>
        <meta name="theme-color" content="#070816" />
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased font-sans">
        <div className="ultra-bg" aria-hidden="true" />
        <div className="ultra-grid" aria-hidden="true" />
        <SettingsProvider>
          <BalanceProvider>
            <AppShell>{children}</AppShell>
          </BalanceProvider>
        </SettingsProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
