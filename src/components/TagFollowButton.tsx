'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { IconMute } from './icons'

export function TagFollowButton({ tagId, initial }: { tagId: string; initial: boolean }) {
  const [following, setFollowing] = useState(initial)
  const [hover, setHover] = useState(false)
  const router = useRouter()

  function toggle() {
    const next = !following
    setFollowing(next)
    fetch(`/api/tags/${tagId}/follow`, { method: next ? 'POST' : 'DELETE' })
      .then((r) => { if (!r.ok) setFollowing(!next); else router.refresh() })
      .catch(() => setFollowing(!next))
  }

  return (
    <>
      <button
        onClick={toggle}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className={`rounded-full px-4 py-2 text-[14px] transition-colors ${
          following
            ? 'border border-[var(--color-border-mid)] text-[var(--color-fg-secondary)] hover:border-[var(--color-fg-error)] hover:text-[var(--color-fg-error)]'
            : 'bg-[var(--color-bg-brand)] text-[var(--color-fg-inverse)] hover:bg-[var(--color-bg-brand-hover)]'
        }`}
      >
        {following ? (hover ? 'Unfollow' : 'Following') : 'Follow'}
      </button>
      <button className="flex items-center gap-2 rounded-full border border-[var(--color-border-mid)] px-4 py-2 text-[14px] text-[var(--color-fg-secondary)] hover:border-[var(--color-fg)] hover:text-[var(--color-fg)]">
        <IconMute size={18} /> Mute
      </button>
    </>
  )
}
