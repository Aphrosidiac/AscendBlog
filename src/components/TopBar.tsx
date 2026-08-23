import Link from 'next/link'
import { Wordmark } from './Wordmark'
import { Avatar } from './Avatar'
import { IconBell, IconMenu, IconSearch, IconWrite } from './icons'
import { UserMenu } from './UserMenu'
import { SearchBox } from './SearchBox'

type U = { id: string; name: string; username: string; avatarUrl?: string | null } | null

/** 65px bar, 1px hairline. Signed-out variant gets the heavier rule + marketing nav. */
export function TopBar({ user, unread = 0, variant = 'app' }: { user: U; unread?: number; variant?: 'app' | 'marketing' }) {
  if (!user || variant === 'marketing') {
    return (
      <header
        className="sticky top-0 z-40 bg-[var(--color-bg)]"
        style={{ height: 65, borderBottom: '1px solid var(--color-fg)' }}
      >
        <div className="mx-auto flex h-full max-w-[1192px] items-center justify-between px-6">
          <Wordmark size={30} />
          <nav className="flex items-center gap-6 text-[14px] text-[var(--color-fg)]">
            <Link href="/about" className="hidden hover:text-[var(--color-fg-hover)] md:block">Our story</Link>
            <Link href="/membership" className="hidden hover:text-[var(--color-fg-hover)] md:block">Membership</Link>
            <Link href="/new-story" className="hidden hover:text-[var(--color-fg-hover)] md:block">Write</Link>
            <Link href="/signin" className="hover:text-[var(--color-fg-hover)]">Sign in</Link>
            <Link
              href="/signup"
              className="rounded-full bg-[var(--color-bg-brand)] px-4 py-2 text-[14px] text-[var(--color-fg-inverse)] transition-colors hover:bg-[var(--color-bg-brand-hover)]"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>
    )
  }

  return (
    <header
      className="sticky top-0 z-40 bg-[var(--color-bg)]"
      style={{ height: 65, borderBottom: '1px solid var(--color-border)' }}
    >
      <div className="flex h-full items-center justify-between pl-[22px] pr-6">
        <div className="flex items-center gap-4">
          <button aria-label="Sidebar menu" className="text-[var(--color-fg)] lg:hidden">
            <IconMenu size={24} />
          </button>
          <Wordmark size={30} />
          <SearchBox />
        </div>
        <div className="flex items-center gap-6">
          <Link
            href="/new-story"
            className="flex items-center gap-2 text-[14px] text-[var(--color-fg-secondary)] transition-colors hover:text-[var(--color-fg)]"
          >
            <IconWrite size={24} />
            <span className="hidden sm:inline">Write</span>
          </Link>
          <Link href="/me/notifications" aria-label="Notifications" className="relative text-[var(--color-fg-secondary)] transition-colors hover:text-[var(--color-fg)]">
            <IconBell size={24} />
            {unread > 0 && (
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[var(--color-bg-error)]" />
            )}
          </Link>
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  )
}

export { IconSearch, Avatar }
