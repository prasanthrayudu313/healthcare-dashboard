import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Centene Intelligence Hub',
  description: 'Real-time healthcare market intelligence dashboard for managed care analysts',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
      </head>
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        {children}
        <footer className="mt-16 border-t border-slate-800/50 py-4 text-center text-xs text-slate-600">
          Centene Intelligence Hub · For informational and business analysis purposes only. Not medical, legal, or investment advice. ·{' '}
          <span className="text-slate-700">Data from public sources</span>
        </footer>
      </body>
    </html>
  )
}
