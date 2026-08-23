import Link from 'next/link'

const FOOTER = [
  ['Help', '/help'], ['Status', '/status'], ['About', '/about'], ['Careers', '/careers'],
  ['Press', '/press'], ['Blog', '/blog'], ['Privacy', '/privacy'], ['Rules', '/rules'],
  ['Terms', '/terms'], ['Text to speech', '/text-to-speech'],
]

/** Signed-out landing: full-bleed hero, heavy rules top and bottom. */
export function Marketing() {
  return (
    <div className="bg-[var(--color-bg-cream)]">
      <section className="relative overflow-hidden border-b border-[var(--color-fg)]">
        <div className="mx-auto flex max-w-[1192px] flex-col justify-center px-6 py-24 md:py-36">
          <h1 className="max-w-[720px] font-[family-name:var(--font-display-serif)] text-[64px] font-normal leading-[0.95] tracking-[-0.03em] text-[var(--color-fg)] md:text-[106px]">
            Ideas worth<br />the climb
          </h1>
          <p className="mt-8 max-w-[520px] text-[20px] leading-[28px] text-[var(--color-fg)] md:mt-10 md:text-[24px]">
            A place to read, write, and think in public.
          </p>
          <Link
            href="/signup"
            className="mt-10 w-fit rounded-full bg-[var(--color-bg-brand)] px-12 py-3 text-[20px] text-[var(--color-fg-inverse)] transition-colors hover:bg-[var(--color-bg-brand-hover)]"
          >
            Start reading
          </Link>
        </div>

        {/* Decorative mark, echoing the "ascend" idea. Purely ornamental. */}
        <svg
          aria-hidden
          viewBox="0 0 400 400"
          className="pointer-events-none absolute -right-10 top-1/2 hidden h-[420px] w-[420px] -translate-y-1/2 text-[var(--color-fg)] opacity-[0.07] lg:block"
        >
          <path d="M40 340 L200 60 L360 340" fill="none" stroke="currentColor" strokeWidth="14" strokeLinejoin="round" />
          <path d="M110 340 L200 180 L290 340" fill="none" stroke="currentColor" strokeWidth="14" strokeLinejoin="round" />
        </svg>
      </section>

      <footer className="border-t border-[var(--color-border-mid)]">
        <nav className="mx-auto flex max-w-[1192px] flex-wrap justify-center gap-x-6 gap-y-3 px-6 py-6 text-[13px] text-[var(--color-fg-secondary)]">
          {FOOTER.map(([label, href]) => (
            <Link key={label} href={href} className="hover:text-[var(--color-fg)]">{label}</Link>
          ))}
        </nav>
      </footer>
    </div>
  )
}
