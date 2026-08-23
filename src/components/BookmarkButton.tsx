'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { IconBookmarkFill, IconBookmarkPlus, IconPlus } from './icons'

type ListRow = { id: string; name: string; isPrivate: boolean; contains: boolean }

/**
 * Click saves straight to the default list (one click, like the original).
 * The chevron-less popover then lets the reader move it between lists.
 */
export function BookmarkButton({ postId, initial, size = 20 }: { postId: string; initial: boolean; size?: number }) {
  const [saved, setSaved] = useState(initial)
  const [open, setOpen] = useState(false)
  const [lists, setLists] = useState<ListRow[] | null>(null)
  const [creating, setCreating] = useState('')
  const wrap = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => { if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false) }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [open])

  async function loadLists() {
    const res = await fetch(`/api/posts/${postId}/lists`)
    if (res.ok) setLists((await res.json()).lists)
  }

  async function toggleDefault() {
    const next = !saved
    setSaved(next)
    const res = await fetch(`/api/posts/${postId}/bookmark`, { method: next ? 'POST' : 'DELETE' })
    if (!res.ok) { setSaved(!next); return }
    if (next) { setOpen(true); loadLists() }
    router.refresh()
  }

  async function toggleList(listId: string, add: boolean) {
    setLists((ls) => ls?.map((l) => (l.id === listId ? { ...l, contains: add } : l)) ?? ls)
    const res = await fetch(`/api/posts/${postId}/lists`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ listId, add }),
    })
    if (res.ok) { setSaved((await res.json()).savedAnywhere); router.refresh() }
  }

  async function createList() {
    const name = creating.trim()
    if (!name) return
    const res = await fetch('/api/lists', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    if (!res.ok) return
    const { id } = await res.json()
    setCreating('')
    await toggleList(id, true)
    loadLists()
  }

  const Icon = saved ? IconBookmarkFill : IconBookmarkPlus
  return (
    <div className="relative" ref={wrap}>
      <button
        onClick={toggleDefault}
        onContextMenu={(e) => { e.preventDefault(); setOpen(true); loadLists() }}
        aria-label={saved ? 'Saved — change list' : 'Save to list'}
        aria-pressed={saved}
        className={`transition-colors ${saved ? 'text-[var(--color-fg)]' : 'text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)]'}`}
      >
        <Icon size={size} />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Save to list"
          className="absolute right-0 top-[30px] z-40 w-[260px] rounded-[4px] border border-[var(--color-border-mid)] bg-[var(--color-bg)] p-3 shadow-[0_2px_10px_rgba(0,0,0,.15)]"
        >
          <p className="mb-2 text-[13px] font-semibold text-[var(--color-fg)]">Save to</p>
          {lists === null ? (
            <p className="py-2 text-[13px] text-[var(--color-fg-secondary)]">Loading…</p>
          ) : (
            <ul className="max-h-[200px] overflow-y-auto">
              {lists.map((l) => (
                <li key={l.id}>
                  <label className="flex cursor-pointer items-center gap-2 py-1.5 text-[14px] text-[var(--color-fg)]">
                    <input
                      type="checkbox"
                      checked={l.contains}
                      onChange={(e) => toggleList(l.id, e.target.checked)}
                    />
                    <span className="clamp-1 flex-1">{l.name}</span>
                    {l.isPrivate && <span className="text-[11px] text-[var(--color-fg-secondary)]">Private</span>}
                  </label>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-2 flex items-center gap-2 border-t border-[var(--color-border)] pt-2">
            <IconPlus size={16} className="text-[var(--color-fg-secondary)]" />
            <input
              value={creating}
              onChange={(e) => setCreating(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') createList() }}
              placeholder="Create new list"
              aria-label="Create a new list"
              className="w-full bg-transparent text-[13px] text-[var(--color-fg)] outline-none placeholder:text-[var(--color-fg-secondary)]"
            />
          </div>
        </div>
      )}
    </div>
  )
}
