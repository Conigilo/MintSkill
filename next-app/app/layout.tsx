import './globals.css'
import { DM_Sans, Fraunces, JetBrains_Mono } from 'next/font/google'
import type { Metadata } from 'next'

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-sans' })
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-serif' })
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: {
    default: 'Skill Wallet — Verified Developer Portfolio',
    template: '%s | Skill Wallet',
  },
  description: 'Build your verified developer portfolio with GitHub integration, skill endorsements, and AI-powered assessments.',
  keywords: ['developer portfolio', 'skill verification', 'github', 'endorsements'],
  authors: [{ name: 'Skill Wallet Team' }],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${dmSans.variable} ${fraunces.variable} ${mono.variable}`}>
      <body className="font-sans antialiased bg-[var(--background)]">{children}</body>
    </html>
  )
}
