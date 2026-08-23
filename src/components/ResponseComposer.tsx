'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

export function ResponseComposer({
  postId, parentId, onDone, autoFocus = false,
}: { postId: string; parentId?: string; onDone?: () => void; autoFocus?: boolean }) {
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [, start] = useTransition()
  const router = useRouter()

  async function submit() {
    const body = text.trim()
    if (!body || busy) return
    setBusy(true)
    const res = await fetch(`/api/posts/${postId}/responses`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text: body, parentId }),
    })
    setBusy(false)
    if (res.ok) {
      setText('')
      onDone?.()
      start(() => router.refresh())
    }
  }

  return (
    <div className="min-w-0 flex-1 rounded-[4px] border border-[var(--color-border-mid)] p-4 shadow-[0_1px_3px_rgba(0,0,0,.06)]">
      <textarea
        value={text}
        autoFocus={autoFocus}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') submit() }}
        placeholder={parentId ? 'Write a reply…' : 'What are your thoughts?'}
        rows={parentId ? 2 : 3}
        className="w-full resize-none bg-transparent text-[14px] leading-[22px] text-[var(--color-fg)] outline-none placeholder:text-[var(--color-fg-secondary)]"
      />
      <div className="mt-2 flex items-center justify-end gap-3">
        {onDone && (
          <button onClick={onDone} className="text-[13px] text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)]">Cancel</button>
        )}
        <button
          onClick={submit}
          disabled={!text.trim() || busy}
          className="rounded-full bg-[var(--color-bg-brand)] px-4 py-1.5 text-[13px] text-[var(--color-fg-inverse)] transition-colors hover:bg-[var(--color-bg-brand-hover)] disabled:opacity-40"
        >
          {busy ? 'Posting…' : 'Respond'}
        </button>
      </div>
    </div>
  )
}
