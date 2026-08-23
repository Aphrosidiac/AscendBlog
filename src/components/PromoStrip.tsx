import { cookies } from 'next/headers'
import Link from 'next/link'
import { DismissPromo } from './DismissPromo'

export const PROMO_COOKIE = 'ascend_promo_dismissed'

/**
 * Membership strip under the header. Dismissal lives in a cookie rather than
 * localStorage so the strip is decided on the server — no flash-in after
 * hydration, and its presence is assertable from the served HTML.
 */
export async function PromoStrip() {
  const dismissed = (await cookies()).get(PROMO_COOKIE)?.value === '1'
  if (dismissed) return null

  return (
    <div className="relative flex items-center justify-center gap-3 bg-[var(--color-highlight)] px-12 py-2.5 text-center">
      <span className="rounded-full bg-white px-2 py-0.5 text-[13px] font-medium text-[#242424]">Membership</span>
      <p className="text-[14px] text-[#242424]">
        Read every story on Ascend, and pay the writers directly.{' '}
        <Link href="/membership" className="font-medium underline">Become a member</Link>
      </p>
      <DismissPromo />
    </div>
  )
}
