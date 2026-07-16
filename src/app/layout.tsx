import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { NotificationsProvider } from '@/components/ui/notifications'
import GoogleMapsProvider from '@/components/GoogleMapsProvider'
import FloatingChatButton from '@/components/FloatingChatButton'
import { SiteFooter } from '@/components/SiteFooter'

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'GlobalBiz AI — Validate before you build',
  description: 'Australian founder intelligence. Validate a new business, diagnose growth, find your next suburb — with real competitor data and AI-led feasibility.',
  openGraph: {
    title: 'GlobalBiz AI',
    description: 'Australian founder intelligence. Validate before you build.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-screen antialiased">
        <GoogleMapsProvider>
          <NotificationsProvider>
            {children}
            <SiteFooter />
          </NotificationsProvider>
          <FloatingChatButton />
        </GoogleMapsProvider>
      </body>
    </html>
  )
}
