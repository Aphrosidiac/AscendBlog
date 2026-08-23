'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { IconClose } from './icons'

const KEY = 'ascend_promo_dismissed'

/** Membership strip under the header. Dismissal sticks across sessions. */
export function PromoStrip() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    setShow(localStorage.getItem(KEY) !== '1')
  }, [])

  if (!show) return null

  function dismiss() {
    localStorage.setItem(KEY, '1')
    setShow(false)
  }

  return (
    <div className="relative flex items-center justify-center gap-3 bg-[var(--color-highlight)] px-12 py-2.5 text-center">
      <span className="rounded-full bg-white px-2 py-0.5 text-[13px] font-medium text-[#242424]">Membership</span>
      <p className="text-[14px] text-[#242424]">
        Read every story on Ascend, and pay the writers directly.{' '}
        <Link href="/membership" className="font-medium underline">Become a member</Link>
      </p>
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="absolute right-4 text-[#242424]/70 transition-colors hover:text-[#242424]"
      >
        <IconClose size={18} />
      </button>
    </div>
  )
}
