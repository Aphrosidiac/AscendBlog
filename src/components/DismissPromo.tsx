'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { IconClose } from './icons'

export function DismissPromo() {
  const [gone, setGone] = useState(false)
  const router = useRouter()

  function dismiss() {
    document.cookie = `ascend_promo_dismissed=1; path=/; max-age=${60 * 60 * 24 * 180}`
    setGone(true)
    router.refresh()
  }

  if (gone) return null
  return (
    <button
      onClick={dismiss}
      aria-label="Dismiss"
      className="absolute right-4 text-[#242424]/70 transition-colors hover:text-[#242424]"
    >
      <IconClose size={18} />
    </button>
  )
}
