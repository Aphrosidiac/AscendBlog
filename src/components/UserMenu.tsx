'use client'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { Avatar } from './Avatar'
import { IconBookmark, IconDoc, IconPerson, IconStats, IconMoon, IconSun } from './icons'

type U = { id: string; name: string; username: string; avatarUrl?: string | null }

const items = [
  { href: '/me/lists', label: 'Library', Icon: IconBookmark },
  { href: '/me/stories/drafts', label: 'Stories', Icon: IconDoc },
  { href: '/me/stats', label: 'Stats', Icon: IconStats },
]

export function UserMenu({ user }: { user: U }) {
  const [open, setOpen] = useState(false)
  const [dark, setDark] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setDark(document.documentElement.dataset.theme === 'dark')
  }, [])

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [open])

  function toggleTheme() {
    const next = dark ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    document.cookie = `theme=${next}; path=/; max-age=${60 * 60 * 24 * 365}`
    setDark(!dark)
  }

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((v) => !v)} aria-label="User options menu" aria-expanded={open} className="block">
        <Avatar user={user} size={32} href={null} />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[42px] w-[220px] rounded-[4px] border border-[var(--color-border-mid)] bg-[var(--color-bg)] py-2 shadow-[0_1px_4px_rgba(0,0,0,.15)]"
        >
          <Link href={`/@${user.username}`} onClick={() => setOpen(false)} className="flex items-center gap-3 px-5 py-2.5 text-[14px] text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)]" role="menuitem">
            <IconPerson size={22} /> Profile
          </Link>
          {items.map(({ href, label, Icon }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)} className="flex items-center gap-3 px-5 py-2.5 text-[14px] text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)]" role="menuitem">
              <Icon size={22} /> {label}
            </Link>
          ))}
          <div className="my-2 h-px bg-[var(--color-border)]" />
          <button onClick={toggleTheme} className="flex w-full items-center gap-3 px-5 py-2.5 text-left text-[14px] text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)]" role="menuitem">
            {dark ? <IconSun size={22} /> : <IconMoon size={22} />} {dark ? 'Light mode' : 'Dark mode'}
          </button>
          <Link href="/me/settings" onClick={() => setOpen(false)} className="block px-5 py-2.5 text-[14px] text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)]" role="menuitem">Settings</Link>
          <div className="my-2 h-px bg-[var(--color-border)]" />
          <form action="/api/auth/signout" method="post">
            <button type="submit" className="w-full px-5 pb-1 pt-2 text-left text-[14px] text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)]" role="menuitem">Sign out</button>
          </form>
          <p className="px-5 pb-2 text-[13px] text-[var(--color-fg-secondary)]">@{user.username}</p>
        </div>
      )}
    </div>
  )
}
