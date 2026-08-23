import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { sans, serif, display, displaySerif } from '@/lib/fonts'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'Ascend', template: '%s | Ascend' },
  description: 'A place to read, write, and deepen your understanding.',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const theme = (await cookies()).get('theme')?.value === 'dark' ? 'dark' : 'light'
  return (
    <html lang="en" data-theme={theme} className={`${sans.variable} ${serif.variable} ${display.variable} ${displaySerif.variable}`}>
      <body>{children}</body>
    </html>
  )
}
