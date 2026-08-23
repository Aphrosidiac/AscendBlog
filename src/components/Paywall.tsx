import Link from 'next/link'

/** Shown in place of the rest of a member-only story. */
export function Paywall() {
  return (
    <div className="relative mt-2">
      {/* fade out of the truncated text above */}
      <div className="pointer-events-none absolute -top-32 left-0 h-32 w-full bg-gradient-to-b from-transparent to-[var(--color-bg)]" />
      <div className="rounded-[4px] border border-[var(--color-border-mid)] bg-[var(--color-bg-story-footer)] px-8 py-10 text-center">
        <p className="text-[13px] uppercase tracking-[0.08em] text-[var(--color-fg-secondary)]">Member-only story</p>
        <h2 className="mt-3 text-[26px] font-bold leading-[32px] text-[var(--color-fg)]">
          Keep reading with a membership
        </h2>
        <p className="mx-auto mt-3 max-w-[420px] text-[15px] leading-[24px] text-[var(--color-fg-secondary)]">
          Members get unlimited access to every story on Ascend, and the writers
          you read are paid directly for it.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/membership"
            className="rounded-full bg-[var(--color-bg-brand)] px-5 py-2.5 text-[15px] text-[var(--color-fg-inverse)] transition-colors hover:bg-[var(--color-bg-brand-hover)]"
          >
            Become a member
          </Link>
          <Link href="/signin" className="text-[15px] text-[var(--color-fg-secondary)] underline hover:text-[var(--color-fg)]">
            Already a member? Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
