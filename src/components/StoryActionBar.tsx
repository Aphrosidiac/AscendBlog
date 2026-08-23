'use client'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { ClapButton } from './ClapButton'
import { BookmarkButton } from './BookmarkButton'
import { IconComment, IconEllipsis, IconPlay, IconRepost, IconShare } from './icons'
import { compactNumber } from '@/lib/utils'

export function StoryActionBar({
  postId, slug, title, clapTotal, myClaps, responseCount, saved, signedIn, isAuthor,
}: {
  postId: string; slug: string; title: string
  clapTotal: number; myClaps: number; responseCount: number
  saved: boolean; signedIn: boolean; isAuthor: boolean
}) {
  const [menu, setMenu] = useState<null | 'share' | 'more'>(null)
  const [speaking, setSpeaking] = useState(false)
  const [copied, setCopied] = useState(false)
  const wrap = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menu) return
    const onDown = (e: MouseEvent) => { if (wrap.current && !wrap.current.contains(e.target as Node)) setMenu(null) }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [menu])

  // Stop narration if the reader navigates away mid-story.
  useEffect(() => () => { if (typeof window !== 'undefined') window.speechSynthesis?.cancel() }, [])

  function copyLink() {
    navigator.clipboard.writeText(location.origin + slug).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 1600); setMenu(null)
    })
  }

  function toggleListen() {
    const synth = window.speechSynthesis
    if (!synth) return
    if (speaking) { synth.cancel(); setSpeaking(false); return }
    const body = document.querySelector('.story-body')
    const text = `${title}. ${body?.textContent ?? ''}`.slice(0, 30000)
    const u = new SpeechSynthesisUtterance(text)
    u.onend = () => setSpeaking(false)
    u.onerror = () => setSpeaking(false)
    synth.speak(u)
    setSpeaking(true)
  }

  return (
    <div
      ref={wrap}
      className="relative mt-8 flex items-center justify-between border-y border-[var(--color-border)] py-2"
    >
      <div className="flex items-center gap-6 text-[var(--color-fg-secondary)]">
        {signedIn ? (
          <ClapButton postId={postId} initial={clapTotal} mine={myClaps} />
        ) : (
          <Link href="/signin" className="flex items-center gap-1.5 text-[14px] hover:text-[var(--color-fg)]">
            <ClapButton postId={postId} initial={clapTotal} mine={0} />
          </Link>
        )}
        <Link href="#responses" className="flex items-center gap-1.5 text-[14px] hover:text-[var(--color-fg)]">
          <IconComment size={24} /> {compactNumber(responseCount)}
        </Link>
        <button aria-label="Repost" className="hover:text-[var(--color-fg)]"><IconRepost size={24} /></button>
      </div>

      <div className="flex items-center gap-6 text-[var(--color-fg-secondary)]">
        {signedIn && <BookmarkButton postId={postId} initial={saved} size={24} />}
        <button
          onClick={toggleListen}
          aria-label={speaking ? 'Stop listening' : 'Listen'}
          aria-pressed={speaking}
          className={speaking ? 'text-[var(--color-fg)]' : 'hover:text-[var(--color-fg)]'}
        >
          <IconPlay size={24} />
        </button>
        <button onClick={() => setMenu(menu === 'share' ? null : 'share')} aria-label="Share Post" aria-expanded={menu === 'share'} className="hover:text-[var(--color-fg)]">
          <IconShare size={24} />
        </button>
        <button onClick={() => setMenu(menu === 'more' ? null : 'more')} aria-label="More options" aria-expanded={menu === 'more'} className="hover:text-[var(--color-fg)]">
          <IconEllipsis size={24} />
        </button>

        {menu === 'share' && (
          <div role="menu" className="absolute right-0 top-[46px] z-40 w-[240px] rounded-[4px] border border-[var(--color-border-mid)] bg-[var(--color-bg)] py-2 shadow-[0_1px_4px_rgba(0,0,0,.15)]">
            <button onClick={copyLink} className="block w-full px-5 py-2.5 text-left text-[14px] text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)]" role="menuitem">Copy link</button>
            <a href={`https://x.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(typeof window !== 'undefined' ? location.origin + slug : slug)}`} target="_blank" rel="noreferrer" className="block px-5 py-2.5 text-[14px] text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)]" role="menuitem">Share on X</a>
            <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== 'undefined' ? location.origin + slug : slug)}`} target="_blank" rel="noreferrer" className="block px-5 py-2.5 text-[14px] text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)]" role="menuitem">Share on LinkedIn</a>
          </div>
        )}

        {menu === 'more' && (
          <div role="menu" className="absolute right-0 top-[46px] z-40 w-[240px] rounded-[4px] border border-[var(--color-border-mid)] bg-[var(--color-bg)] py-2 shadow-[0_1px_4px_rgba(0,0,0,.15)]">
            {isAuthor && (
              <Link href={`/p/${postId}/edit`} className="block px-5 py-2.5 text-[14px] text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)]" role="menuitem">Edit story</Link>
            )}
            <button onClick={() => window.print()} className="block w-full px-5 py-2.5 text-left text-[14px] text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)]" role="menuitem">Print</button>
            <button className="block w-full px-5 py-2.5 text-left text-[14px] text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)]" role="menuitem">Mute this author</button>
            <button className="block w-full px-5 py-2.5 text-left text-[14px] text-[var(--color-fg-error)]" role="menuitem">Report story</button>
          </div>
        )}
      </div>

      {copied && (
        <span role="status" className="absolute right-0 top-[-38px] rounded bg-[var(--color-bg-inverse)] px-3 py-1.5 text-[13px] text-[var(--color-fg-inverse)]">
          Link copied
        </span>
      )}
    </div>
  )
}
