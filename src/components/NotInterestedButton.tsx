'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

/** "Show less like this" — hides the story and offers a single undo. */
export function NotInterestedButton({ postId }: { postId: string }) {
  const [hidden, setHidden] = useState(false)
  const router = useRouter()

  async function hide() {
    setHidden(true)
    const res = await fetch(`/api/posts/${postId}/not-interested`, { method: 'POST' })
    if (!res.ok) setHidden(false)
  }

  async function undo() {
    setHidden(false)
    await fetch(`/api/posts/${postId}/not-interested`, { method: 'DELETE' })
    router.refresh()
  }

  if (hidden) {
    return (
      <span className="flex items-center gap-2 text-[13px] text-[var(--color-fg-secondary)]">
        You&rsquo;ll see fewer like this.
        <button onClick={undo} className="underline hover:text-[var(--color-fg)]">Undo</button>
      </span>
    )
  }

  return (
    <button
      onClick={hide}
      aria-label="Show less like this"
      title="Show less like this"
      className="hidden text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)] sm:block"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M7 4h9.5a2 2 0 0 1 2 1.6l1 5A2 2 0 0 1 17.5 13H13l.8 3.5a2 2 0 0 1-1.95 2.5L7 10.5V4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M4 4h3v6.5H4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    </button>
  )
}
