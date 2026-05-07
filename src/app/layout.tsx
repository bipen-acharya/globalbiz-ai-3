import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { NotificationsProvider } from '@/components/ui/notifications'
import FloatingChatButton from '@/components/FloatingChatButton'
import GoogleMapsProvider from '@/components/GoogleMapsProvider'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'GlobalBiz AI — Business Feasibility Intelligence',
  description: 'Find out if your business idea will work in your country, city, and community before you invest a single dollar.',
  openGraph: {
    title: 'GlobalBiz AI',
    description: 'AI-powered business feasibility reports for every country.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={plusJakartaSans.variable}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-screen antialiased">
        <GoogleMapsProvider>
          <NotificationsProvider>{children}</NotificationsProvider>
          <FloatingChatButton />
        </GoogleMapsProvider>
      </body>
    </html>
  )
}
