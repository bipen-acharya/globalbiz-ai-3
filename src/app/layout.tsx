import type { Metadata } from 'next'
import './globals.css'
import { NotificationsProvider } from '@/components/ui/notifications'

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
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Google Fonts loaded via globals.css @import */}
      </head>
      <body className="min-h-screen antialiased">
        <NotificationsProvider>{children}</NotificationsProvider>
      </body>
    </html>
  )
}
