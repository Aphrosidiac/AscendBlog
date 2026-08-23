import Link from 'next/link'
import { Avatar } from './Avatar'
import { FollowButton } from './FollowButton'
import { IconVerified } from './icons'

export function StoryFooter({
  tags, author, isFollowing, showFollow,
}: {
  tags: { slug: string; name: string }[]
  author: { id: string; name: string; username: string; avatarUrl: string | null; bio: string | null; isVerified: boolean }
  isFollowing: boolean
  showFollow: boolean
}) {
  return (
    <footer className="mt-14">
      {tags.length > 0 && (
        <ul className="flex flex-wrap gap-2 border-b border-[var(--color-border)] pb-10">
          {tags.map((t) => (
            <li key={t.slug}>
              <Link
                href={`/tag/${t.slug}`}
                className="inline-block rounded-full bg-[var(--color-bg-secondary)] px-4 py-2 text-[13px] text-[var(--color-fg)] hover:bg-[var(--color-border-hover)]"
              >
                {t.name}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-start gap-4 py-10">
        <Avatar user={author} size={72} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-4">
            <Link href={`/@${author.username}`} className="flex items-center gap-2 text-[22px] font-bold text-[var(--color-fg)] hover:underline">
              {author.name}
              {author.isVerified && <IconVerified />}
            </Link>
            {showFollow && <FollowButton userId={author.id} initial={isFollowing} size="md" />}
          </div>
          {author.bio && <p className="mt-2 text-[14px] leading-[20px] text-[var(--color-fg-secondary)]">{author.bio}</p>}
        </div>
      </div>
    </footer>
  )
}
