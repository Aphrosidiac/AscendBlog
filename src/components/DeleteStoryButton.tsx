'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function DeleteStoryButton({ postId }: { postId: string }) {
  const [busy, setBusy] = useState(false)
  const router = useRouter()

  async function remove() {
    if (!confirm('Delete this story? This cannot be undone.')) return
    setBusy(true)
    const res = await fetch(`/api/posts/${postId}`, { method: 'DELETE' })
    setBusy(false)
    if (res.ok) router.refresh()
  }

  return (
    <button onClick={remove} disabled={busy} className="hover:text-[var(--color-fg-error)] disabled:opacity-50">
      {busy ? 'Deleting…' : 'Delete'}
    </button>
  )
}
