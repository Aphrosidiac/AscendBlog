'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { IconBookmarkFill, IconBookmarkPlus } from './icons'

export function BookmarkButton({ postId, initial, size = 20 }: { postId: string; initial: boolean; size?: number }) {
  const [saved, setSaved] = useState(initial)
  const [, start] = useTransition()
  const router = useRouter()

  function toggle() {
    const next = !saved
    setSaved(next)
    fetch(`/api/posts/${postId}/bookmark`, { method: next ? 'POST' : 'DELETE' })
      .then((r) => { if (!r.ok) { setSaved(!next); return } start(() => router.refresh()) })
      .catch(() => setSaved(!next))
  }

  const Icon = saved ? IconBookmarkFill : IconBookmarkPlus
  return (
    <button
      onClick={toggle}
      aria-label={saved ? 'Remove from list' : 'Save to list'}
      aria-pressed={saved}
      className={`transition-colors ${saved ? 'text-[var(--color-fg)]' : 'text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)]'}`}
    >
      <Icon size={size} />
    </button>
  )
}
