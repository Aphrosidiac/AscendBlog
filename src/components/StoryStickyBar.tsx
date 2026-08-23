'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Avatar } from './Avatar'
import { ClapButton } from './ClapButton'
import { BookmarkButton } from './BookmarkButton'
import { IconComment, IconShare } from './icons'
import { compactNumber } from '@/lib/utils'

/** Appears once the reader is past the masthead, the way the original's does. */
export function StoryStickyBar({
  title, author, postId, clapTotal, myClaps, responseCount, saved, signedIn,
}: {
  title: string
  author: { name: string; username: string; avatarUrl: string | null }
  postId: string
  clapTotal: number
  myClaps: number
  responseCount: number
  saved: boolean
  signedIn: boolean
}) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 420)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!show) return null

  return (
    <div
      className="fixed inset-x-0 z-30 border-b border-[var(--color-border)] bg-[var(--color-bg)]/95 backdrop-blur"
      style={{ top: 'var(--height-header)' }}
    >
      <div className="mx-auto flex h-[54px] w-full items-center justify-between gap-6 px-6" style={{ maxWidth: 1100 }}>
        <div className="flex min-w-0 items-center gap-3">
          <Avatar user={author} size={24} />
          <p className="clamp-1 text-[14px] text-[var(--color-fg)]">
            <span className="font-semibold">{title}</span>
            <span className="text-[var(--color-fg-secondary)]"> · </span>
            <Link href={`/@${author.username}`} className="text-[var(--color-fg-secondary)] hover:underline">{author.name}</Link>
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-5 text-[var(--color-fg-secondary)]">
          <ClapButton postId={postId} initial={clapTotal} mine={myClaps} compact />
          <Link href="#responses" className="flex items-center gap-1.5 text-[13px] hover:text-[var(--color-fg)]">
            <IconComment size={18} /> {compactNumber(responseCount)}
          </Link>
          {signedIn && <BookmarkButton postId={postId} initial={saved} size={18} />}
          <button
            onClick={() => navigator.clipboard.writeText(location.href)}
            aria-label="Copy link"
            className="hover:text-[var(--color-fg)]"
          >
            <IconShare size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
