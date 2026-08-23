import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Our story' }

export default function AboutPage() {
  return (
    <main className="min-w-0 flex-1 px-6">
      <div className="mx-auto w-full py-20" style={{ maxWidth: 680 }}>
        <h1 className="font-[family-name:var(--font-display-serif)] text-[64px] leading-[1.05] tracking-[-0.02em] text-[var(--color-fg)]">
          Every idea deserves a proper hearing.
        </h1>
        <div className="story-body mt-12">
          <p>
            Ascend is a place for writing that takes its time. Not posts optimised for a
            scroll, but pieces long enough to make an argument and honest enough to show
            where the argument runs out.
          </p>
          <h2>What we are for</h2>
          <p>
            Most publishing tools optimise for volume. We would rather optimise for the
            reader who finishes the piece and thinks about it a day later. That shapes
            everything here: the reading column is narrow because narrow columns are
            easier to read, the typography is set for long-form, and nothing interrupts
            the text to sell you something.
          </p>
          <h2>Who writes here</h2>
          <p>
            Anyone can publish. There is no application and no editorial gate. What there
            is instead is a set of topics, a following graph, and readers who decide what
            travels. If you write something good, the people who care about that subject
            are the ones most likely to find it.
          </p>
          <h2>How it pays for itself</h2>
          <p>
            Membership. Readers who want unlimited access to member-only stories pay for
            it, and that money goes to the people writing them. No advertising, and no
            arrangement where your attention is the product being sold.
          </p>
        </div>
        <Link
          href="/signup"
          className="mt-12 inline-block rounded-full bg-[var(--color-bg-brand)] px-6 py-3 text-[16px] text-[var(--color-fg-inverse)] transition-colors hover:bg-[var(--color-bg-brand-hover)]"
        >
          Start writing
        </Link>
      </div>
    </main>
  )
}
