import Link from 'next/link'

/** Ascend wordmark — Outfit, the brand's display face. */
export function Wordmark({ size = 30, href = '/' }: { size?: number; href?: string | null }) {
  const mark = (
    <span
      className="font-[family-name:var(--font-display)] font-semibold tracking-[-0.03em] text-[var(--color-fg)] leading-none"
      style={{ fontSize: size }}
    >
      Ascend
    </span>
  )
  return href === null ? mark : <Link href={href} aria-label="Ascend home">{mark}</Link>
}
