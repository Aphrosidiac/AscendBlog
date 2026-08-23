'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function FollowButton({
  userId, initial, size = 'sm',
}: { userId: string; initial: boolean; size?: 'sm' | 'md' }) {
  const [following, setFollowing] = useState(initial)
  const [hover, setHover] = useState(false)
  const router = useRouter()

  function toggle() {
    const next = !following
    setFollowing(next)
    fetch(`/api/users/${userId}/follow`, { method: next ? 'POST' : 'DELETE' })
      .then((r) => { if (!r.ok) setFollowing(!next); else router.refresh() })
      .catch(() => setFollowing(!next))
  }

  const pad = size === 'md' ? 'px-4 py-2 text-[14px]' : 'px-3 py-1.5 text-[13px]'
  return (
    <button
      onClick={toggle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`rounded-full transition-colors ${pad} ${
        following
          ? 'border border-[var(--color-border-mid)] text-[var(--color-fg-secondary)] hover:border-[var(--color-fg-error)] hover:text-[var(--color-fg-error)]'
          : 'bg-[var(--color-bg-brand)] text-[var(--color-fg-inverse)] hover:bg-[var(--color-bg-brand-hover)]'
      }`}
    >
      {following ? (hover ? 'Unfollow' : 'Following') : 'Follow'}
    </button>
  )
}
