import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Outfit, Space_Mono } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const outfit = Outfit({ variable: '--font-outfit', subsets: ['latin'] })
const spaceMono = Space_Mono({
  variable: '--font-space-mono',
  subsets: ['latin'],
  weight: ['400', '700'],
})

export const metadata: Metadata = {
  title: 'AURA — Evolve Your Self',
  description:
    'A gamified self-growth platform. Track your goals through Life Cards and watch your digital avatar evolve as you grow.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#020509',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`dark ${outfit.variable} ${spaceMono.variable} bg-background`}
    >
      <body className="font-sans antialiased">
        {children}
        <Toaster
          position="top-center"
          theme="dark"
          toastOptions={{
            style: {
              background: '#111a2e',
              border: '1px solid rgba(79,143,255,0.2)',
              color: '#dde8ff',
            },
          }}
        />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
