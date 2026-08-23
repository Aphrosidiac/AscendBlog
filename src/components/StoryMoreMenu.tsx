'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { IconEllipsis } from './icons'
import { ReportDialog } from './ReportDialog'

export function StoryMoreMenu({
  postId, authorId, authorName, isAuthor = false,
}: { postId: string; authorId: string; authorName: string; isAuthor?: boolean }) {
  const [open, setOpen] = useState(false)
  const [reporting, setReporting] = useState(false)
  const [muted, setMuted] = useState(false)
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

  async function toggleMute() {
    const next = !muted
    setMuted(next)
    const res = await fetch(`/api/users/${authorId}/mute`, { method: next ? 'POST' : 'DELETE' })
    if (!res.ok) { setMuted(!next); return }
    setOpen(false)
    router.refresh()
  }

  const item = 'block w-full px-5 py-2.5 text-left text-[14px] text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)]'

  return (
    <div className="relative" ref={wrap}>
      <button onClick={() => setOpen((v) => !v)} aria-label="More options" aria-expanded={open} className="hover:text-[var(--color-fg)]">
        <IconEllipsis size={20} />
      </button>

      {open && (
        <div role="menu" className="absolute right-0 top-[28px] z-40 w-[220px] rounded-[4px] border border-[var(--color-border-mid)] bg-[var(--color-bg)] py-2 shadow-[0_2px_10px_rgba(0,0,0,.15)]">
          <button
            onClick={() => { navigator.clipboard.writeText(location.origin + location.pathname); setOpen(false) }}
            className={item}
            role="menuitem"
          >
            Copy link
          </button>
          {!isAuthor && (
            <button onClick={toggleMute} className={item} role="menuitem">
              {muted ? `Unmute ${authorName}` : `Mute ${authorName}`}
            </button>
          )}
          {!isAuthor && (
            <button
              onClick={() => { setReporting(true); setOpen(false) }}
              className="block w-full px-5 py-2.5 text-left text-[14px] text-[var(--color-fg-error)]"
              role="menuitem"
            >
              Report story
            </button>
          )}
        </div>
      )}

      {reporting && <ReportDialog postId={postId} onClose={() => setReporting(false)} />}
    </div>
  )
}
