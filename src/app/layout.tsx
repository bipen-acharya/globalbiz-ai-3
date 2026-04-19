import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'VisaGuide AU — Australian Visa Guidance',
  description: 'AI-powered Australian visa guidance. Get instant answers about 482, 189, 190, 485, partner visas and more.',
  openGraph: {
    title: 'VisaGuide AU — Australian Visa Guidance',
    description: 'Chat with an AI expert about Australian visa subclasses, eligibility, costs, and pathways to permanent residence.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  )
}
