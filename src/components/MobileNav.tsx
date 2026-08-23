'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Avatar } from './Avatar'
import {
  IconBookmark, IconClose, IconDoc, IconHome, IconMenu,
  IconPerson, IconStats, IconPeople, IconMoon, IconSun,
} from './icons'

type U = { id: string; name: string; username: string; avatarUrl?: string | null }

export function MobileNav({ user }: { user: U }) {
  const [open, setOpen] = useState(false)
  const [dark, setDark] = useState(false)

  useEffect(() => { setDark(document.documentElement.dataset.theme === 'dark') }, [])

  // A drawer that leaves the page scrollable behind it feels broken on a phone.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const items = [
    { href: '/', label: 'Home', Icon: IconHome },
    { href: '/me/lists', label: 'Library', Icon: IconBookmark },
    { href: `/@${user.username}`, label: 'Profile', Icon: IconPerson },
    { href: '/me/stories/drafts', label: 'Stories', Icon: IconDoc },
    { href: '/me/stats', label: 'Stats', Icon: IconStats },
    { href: '/explore', label: 'Following', Icon: IconPeople },
  ]

  function toggleTheme() {
    const next = dark ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    document.cookie = `theme=${next}; path=/; max-age=${60 * 60 * 24 * 365}`
    setDark(!dark)
  }

  return (
    <>
      <button onClick={() => setOpen(true)} aria-label="Sidebar menu" aria-expanded={open} className="text-[var(--color-fg)] lg:hidden">
        <IconMenu size={24} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button aria-label="Close menu" onClick={() => setOpen(false)} className="absolute inset-0 bg-black/40" />
          <nav
            aria-label="Primary mobile"
            className="absolute inset-y-0 left-0 flex w-[280px] flex-col bg-[var(--color-bg)] px-6 py-5 shadow-[2px_0_12px_rgba(0,0,0,.15)]"
          >
            <div className="flex items-center justify-between">
              <Avatar user={user} size={40} />
              <button onClick={() => setOpen(false)} aria-label="Close menu" className="text-[var(--color-fg-secondary)]">
                <IconClose size={24} />
              </button>
            </div>
            <p className="mt-3 text-[16px] font-semibold text-[var(--color-fg)]">{user.name}</p>
            <p className="text-[13px] text-[var(--color-fg-secondary)]">@{user.username}</p>

            <ul className="mt-6 flex-1">
              {items.map(({ href, label, Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-4 py-3 text-[15px] text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)]"
                  >
                    <Icon size={24} /> {label}
                  </Link>
                </li>
              ))}
            </ul>

            <button onClick={toggleTheme} className="flex items-center gap-4 border-t border-[var(--color-border)] py-4 text-[15px] text-[var(--color-fg-secondary)]">
              {dark ? <IconSun size={22} /> : <IconMoon size={22} />} {dark ? 'Light mode' : 'Dark mode'}
            </button>
            <Link href="/me/settings" onClick={() => setOpen(false)} className="py-2 text-[15px] text-[var(--color-fg-secondary)]">Settings</Link>
            <form action="/api/auth/signout" method="post">
              <button type="submit" className="py-2 text-left text-[15px] text-[var(--color-fg-secondary)]">Sign out</button>
            </form>
          </nav>
        </div>
      )}
    </>
  )
}
