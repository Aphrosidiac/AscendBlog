'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { IconRepost } from './icons'
import { compactNumber } from '@/lib/utils'

export function RepostButton({
  postId, initial, count: initialCount, size = 18, showCount = false,
}: { postId: string; initial: boolean; count?: number; size?: number; showCount?: boolean }) {
  const [reposted, setReposted] = useState(initial)
  const [count, setCount] = useState(initialCount ?? 0)
  const router = useRouter()

  async function toggle() {
    const next = !reposted
    setReposted(next)
    setCount((c) => c + (next ? 1 : -1))
    const res = await fetch(`/api/posts/${postId}/repost`, {
      method: next ? 'POST' : 'DELETE',
      headers: { 'content-type': 'application/json' },
      body: next ? JSON.stringify({}) : undefined,
    })
    if (!res.ok) { setReposted(!next); setCount((c) => c + (next ? -1 : 1)); return }
    const j = await res.json()
    setCount(j.count)
    router.refresh()
  }

  return (
    <button
      onClick={toggle}
      aria-label={reposted ? 'Undo repost' : 'Repost'}
      aria-pressed={reposted}
      title={reposted ? 'Reposted to your followers' : 'Repost to your followers'}
      className={`flex items-center gap-1.5 transition-colors ${
        reposted ? 'text-[var(--color-fg)]' : 'text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)]'
      }`}
    >
      <IconRepost size={size} />
      {showCount && count > 0 && <span className="text-[13px]">{compactNumber(count)}</span>}
    </button>
  )
}
