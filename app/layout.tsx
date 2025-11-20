import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'EnduwaWill - Estate Planning Made Simple',
  description: 'Create your will and trust with confidence',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
