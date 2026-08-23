import { Wordmark } from '@/components/Wordmark'
import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <header className="flex h-[65px] items-center justify-between border-b border-[var(--color-fg)] px-6">
        <Wordmark size={30} />
        <Link href="/" className="text-[14px] text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)]">Back home</Link>
      </header>
      <main className="mx-auto flex max-w-[380px] flex-col items-center px-6 py-20">{children}</main>
    </div>
  )
}
