import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Jumanji Board Game Shop',
  description: 'Professional board game shop management system with session tracking and analytics',
  keywords: 'board games, shop management, session tracking, gaming cafe',
  authors: [{ name: 'Jumanji Board Game Shop' }],
  viewport: 'width=device-width, initial-scale=1',
  icons: {
    icon: '/favicon_final.ico',
    shortcut: '/favicon_final.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon_final.ico" />
        <link rel="shortcut icon" href="/favicon_final.ico" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body className={inter.className}>
        <div id="root">
          {children}
        </div>
      </body>
    </html>
  )
}
