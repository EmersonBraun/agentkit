import './global.css'
import { RootProvider } from 'fumadocs-ui/provider/next'
import { Inter } from 'next/font/google'
import type { ReactNode } from 'react'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: {
    default: 'AgentsKit',
    template: '%s | AgentsKit',
  },
  description: 'The complete toolkit for building AI agents in JavaScript.',
  metadataBase: new URL('https://agentskit.io'),
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  )
}
