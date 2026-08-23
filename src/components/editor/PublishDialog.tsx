'use client'
import { useEffect, useState } from 'react'

const MAX_TAGS = 5

export function PublishDialog({
  postId, allTags, initialTags, alreadyPublished, onClose, onDone, beforePublish,
}: {
  postId: string
  allTags: { slug: string; name: string }[]
  initialTags: string[]
  alreadyPublished: boolean
  onClose: () => void
  onDone: (path: string) => void
  beforePublish: () => Promise<void>
}) {
  const [tags, setTags] = useState<string[]>(initialTags)
  const [query, setQuery] = useState('')
  const [memberOnly, setMemberOnly] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const suggestions = allTags
    .filter((t) => !tags.includes(t.slug) && t.name.toLowerCase().includes(query.trim().toLowerCase()))
    .slice(0, 6)

  function addTag(slug: string) {
    if (tags.length >= MAX_TAGS) return
    setTags((t) => [...t, slug])
    setQuery('')
  }

  async function publish() {
    setBusy(true)
    setError(null)
    await beforePublish()
    const res = await fetch(`/api/posts/${postId}/publish`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ tags, isMemberOnly: memberOnly }),
    })
    setBusy(false)
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      setError(j?.error ?? 'Could not publish. Try again.')
      return
    }
    const { path } = await res.json()
    onDone(path)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 dark:bg-black/95" role="dialog" aria-modal="true" aria-label="Publish story">
      <button onClick={onClose} aria-label="Close" className="absolute right-6 top-6 text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)]">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
      </button>

      <div className="w-full max-w-[540px] px-6">
        <h2 className="text-[20px] font-bold text-[var(--color-fg)]">
          {alreadyPublished ? 'Update your story' : 'Story preview'}
        </h2>
        <p className="mt-4 text-[14px] text-[var(--color-fg-secondary)]">
          Add up to {MAX_TAGS} topics so the right readers can find this.
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {tags.map((slug) => {
            const t = allTags.find((x) => x.slug === slug)
            return (
              <span key={slug} className="inline-flex items-center gap-2 rounded-full bg-[var(--color-bg-secondary)] px-3 py-1.5 text-[13px] text-[var(--color-fg)]">
                {t?.name ?? slug}
                <button onClick={() => setTags((v) => v.filter((s) => s !== slug))} aria-label={`Remove ${t?.name ?? slug}`} className="text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)]">×</button>
              </span>
            )
          })}
        </div>

        {tags.length < MAX_TAGS && (
          <>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Add a topic…"
              aria-label="Add a topic"
              className="mt-3 w-full border-b border-[var(--color-border-mid)] bg-transparent py-2 text-[14px] text-[var(--color-fg)] outline-none focus:border-[var(--color-fg)]"
            />
            {suggestions.length > 0 && (
              <ul className="mt-2 flex flex-wrap gap-2">
                {suggestions.map((t) => (
                  <li key={t.slug}>
                    <button onClick={() => addTag(t.slug)} className="rounded-full border border-[var(--color-border-mid)] px-3 py-1.5 text-[13px] text-[var(--color-fg-secondary)] hover:border-[var(--color-fg)] hover:text-[var(--color-fg)]">
                      {t.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        <label className="mt-6 flex items-center gap-2 text-[14px] text-[var(--color-fg-secondary)]">
          <input type="checkbox" checked={memberOnly} onChange={(e) => setMemberOnly(e.target.checked)} />
          Make this a member-only story
        </label>

        {error && <p role="alert" className="mt-4 text-[13px] text-[var(--color-fg-error)]">{error}</p>}

        <div className="mt-8 flex items-center gap-4">
          <button
            onClick={publish}
            disabled={busy}
            className="rounded-full bg-[var(--color-bg-brand)] px-4 py-2 text-[14px] text-[var(--color-fg-inverse)] transition-colors hover:bg-[var(--color-bg-brand-hover)] disabled:opacity-50"
          >
            {busy ? 'Publishing…' : alreadyPublished ? 'Update story' : 'Publish now'}
          </button>
          <button onClick={onClose} className="text-[14px] text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)]">Cancel</button>
        </div>
      </div>
    </div>
  )
}
