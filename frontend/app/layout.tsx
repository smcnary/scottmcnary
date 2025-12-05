import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'In Memory of Scott Roberts McNary',
  description: 'A memorial site celebrating the life and memories of Scott Roberts McNary',
  keywords: ['Scott Roberts McNary', 'memorial', 'remembrance'],
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




