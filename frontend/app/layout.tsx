import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'In Loving Memory of Scott R. McNary',
  description: 'A memorial site celebrating the life and memories of Scott R. McNary',
  keywords: ['Scott R. McNary', 'memorial', 'remembrance'],
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




