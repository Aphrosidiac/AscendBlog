import Link from 'next/link'
import { avatarColor } from '@/lib/utils'

export function Avatar({
  user, size = 32, href, className = '',
}: {
  user: { name: string; username: string; avatarUrl?: string | null }
  size?: number
  href?: string | null
  className?: string
}) {
  const initial = (user.name || user.username || '?').trim().charAt(0).toUpperCase()
  const img = (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--color-bg-secondary)] ${className}`}
      style={{ width: size, height: size }}
      aria-hidden={href ? undefined : true}
    >
      {user.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={user.avatarUrl} alt={user.name} width={size} height={size} className="h-full w-full object-cover" />
      ) : (
        <span
          className="flex h-full w-full items-center justify-center font-medium text-white"
          style={{ background: avatarColor(user.username || user.name), fontSize: size * 0.44 }}
        >
          {initial}
        </span>
      )}
    </span>
  )
  if (href === null) return img
  return (
    <Link href={href ?? `/@${user.username}`} aria-label={user.name} className="shrink-0">
      {img}
    </Link>
  )
}
