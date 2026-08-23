'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Avatar } from './Avatar'
import {
  IconBookmark, IconBookmarkFill, IconDoc, IconHome, IconHomeFill,
  IconPerson, IconPersonFill, IconPlus, IconStats, IconPeople,
} from './icons'

type U = { id: string; name: string; username: string; avatarUrl?: string | null }
type Suggestion = { id: string; name: string; username: string; avatarUrl?: string | null }

export function LeftRail({ user, following = [] }: { user: U; following?: Suggestion[] }) {
  const path = usePathname()
  const nav = [
    { href: '/', label: 'Home', Icon: IconHome, IconOn: IconHomeFill, exact: true },
    { href: '/me/lists', label: 'Library', Icon: IconBookmark, IconOn: IconBookmarkFill },
    { href: `/@${user.username}`, label: 'Profile', Icon: IconPerson, IconOn: IconPersonFill },
    { href: '/me/stories/drafts', label: 'Stories', Icon: IconDoc, IconOn: IconDoc },
    { href: '/me/stats', label: 'Stats', Icon: IconStats, IconOn: IconStats },
  ]

  return (
    <nav
      className="sticky hidden shrink-0 self-start pl-[34px] pr-6 pt-[26px] lg:block"
      style={{ width: 'var(--width-rail)', top: 'var(--height-header)', height: 'calc(100vh - var(--height-header))' }}
      aria-label="Primary"
    >
      <ul>
        {nav.map(({ href, label, Icon, IconOn, exact }) => {
          const active = exact ? path === href : path.startsWith(href)
          const I = active ? IconOn : Icon
          return (
            <li key={href} className="relative">
              {active && <span className="absolute -left-[34px] top-1/2 h-[22px] w-[2px] -translate-y-1/2 bg-[var(--color-fg)]" aria-hidden />}
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-3 py-[9px] text-[14px] transition-colors ${
                  active ? 'text-[var(--color-fg)]' : 'text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)]'
                }`}
              >
                <I size={24} />
                {label}
              </Link>
            </li>
          )
        })}
      </ul>

      <div className="my-6 h-px w-full bg-[var(--color-border)]" />

      <Link href="/me/following" className="flex items-center gap-3 py-[9px] text-[14px] text-[var(--color-fg-secondary)] transition-colors hover:text-[var(--color-fg)]">
        <IconPeople size={24} /> Following
      </Link>

      {following.length > 0 ? (
        <ul className="mt-3 space-y-3">
          {following.slice(0, 5).map((f) => (
            <li key={f.id}>
              <Link href={`/@${f.username}`} className="flex items-center gap-2 text-[13px] text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)]">
                <Avatar user={f} size={20} href={null} />
                <span className="clamp-1">{f.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-3">
          <Link href="/explore" className="flex items-start gap-3 py-[9px] text-[14px] text-[var(--color-fg-secondary)] transition-colors hover:text-[var(--color-fg)]">
            <IconPlus size={24} className="mt-px shrink-0" />
            <span>Find writers and publications to follow.</span>
          </Link>
          <Link href="/explore" className="ml-9 block text-[13px] text-[var(--color-fg-secondary)] underline hover:text-[var(--color-fg)]">
            See suggestions
          </Link>
        </div>
      )}
    </nav>
  )
}
