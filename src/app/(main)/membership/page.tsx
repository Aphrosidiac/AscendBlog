import Link from 'next/link'
import type { Metadata } from 'next'
import { IconCheck } from '@/components/icons'

export const metadata: Metadata = { title: 'Membership' }

const INCLUDED = [
  'Unlimited access to every member-only story',
  'Support the writers you read, directly',
  'Save stories to read offline',
  'Listen to any story read aloud',
  'An ad-free reading experience, always',
]

export default function MembershipPage() {
  return (
    <main className="min-w-0 flex-1 px-6">
      <div className="mx-auto w-full py-20 text-center" style={{ maxWidth: 680 }}>
        <h1 className="font-[family-name:var(--font-display-serif)] text-[56px] leading-[1.05] tracking-[-0.02em] text-[var(--color-fg)]">
          Read without limits.
        </h1>
        <p className="mx-auto mt-6 max-w-[520px] text-[20px] leading-[30px] text-[var(--color-fg-secondary)]">
          Membership keeps Ascend running on readers rather than advertisers, and pays the
          people whose writing you actually finish.
        </p>

        <ul className="mx-auto mt-12 max-w-[420px] space-y-4 text-left">
          {INCLUDED.map((t) => (
            <li key={t} className="flex items-start gap-3 text-[16px] leading-[24px] text-[var(--color-fg)]">
              <IconCheck size={20} className="mt-0.5 shrink-0 text-[var(--color-fg-accent)]" />
              {t}
            </li>
          ))}
        </ul>

        <div className="mx-auto mt-12 max-w-[420px] rounded-[4px] border border-[var(--color-border-mid)] p-8">
          <p className="text-[32px] font-bold text-[var(--color-fg)]">RM25<span className="text-[16px] font-normal text-[var(--color-fg-secondary)]">/month</span></p>
          <p className="mt-1 text-[14px] text-[var(--color-fg-secondary)]">Cancel any time.</p>
          <Link
            href="/signup"
            className="mt-6 block rounded-full bg-[var(--color-bg-brand)] px-6 py-3 text-[16px] text-[var(--color-fg-inverse)] transition-colors hover:bg-[var(--color-bg-brand-hover)]"
          >
            Become a member
          </Link>
        </div>
      </div>
    </main>
  )
}
