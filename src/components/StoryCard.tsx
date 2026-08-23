import Link from 'next/link'
import { Avatar } from './Avatar'
import { ClapButton } from './ClapButton'
import { BookmarkButton } from './BookmarkButton'
import { IconComment, IconEllipsis, IconRepost, IconVerified } from './icons'
import { compactNumber, formatDate } from '@/lib/utils'

export type FeedStory = {
  id: string
  slug: string
  title: string
  subtitle: string | null
  excerpt: string
  coverImage: string | null
  readingTime: number
  publishedAt: Date | string | null
  isMemberOnly: boolean
  author: { id: string; name: string; username: string; avatarUrl: string | null; isVerified?: boolean }
  publication: { slug: string; name: string } | null
  clapCount: number
  responseCount: number
  saved?: boolean
}

/**
 * Feed card. 680 total: a 464 text column, 16 gutter, 200x134 thumbnail.
 * The action row sits under the text column only — the image spans both rows.
 */
export function StoryCard({ story, reason }: { story: FeedStory; reason?: string }) {
  const href = `/@${story.author.username}/${story.slug}`
  return (
    <article className="border-b border-[var(--color-border)] py-6">
      {reason && <p className="mb-3 text-[13px] text-[var(--color-fg-secondary)]">{reason}</p>}

      <div className="mb-2 flex items-center gap-2 text-[13px] leading-[20px] text-[var(--color-fg)]">
        <Avatar user={story.author} size={20} />
        {story.publication ? (
          <span className="flex items-center gap-1">
            <span className="text-[var(--color-fg-secondary)]">In</span>
            <Link href={`/${story.publication.slug}`} className="hover:underline">{story.publication.name}</Link>
            <span className="text-[var(--color-fg-secondary)]">by</span>
            <Link href={`/@${story.author.username}`} className="hover:underline">{story.author.name}</Link>
          </span>
        ) : (
          <Link href={`/@${story.author.username}`} className="hover:underline">{story.author.name}</Link>
        )}
        {story.author.isVerified && <IconVerified />}
        {story.publishedAt && (
          <span className="text-[var(--color-fg-secondary)]">· {formatDate(story.publishedAt)}</span>
        )}
      </div>

      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <Link href={href} className="group block">
            <h2 className="clamp-2 text-[16px] font-bold leading-[20px] tracking-[-0.016em] text-[var(--color-fg)] sm:text-[24px] sm:leading-[30px]">
              {story.title}
            </h2>
            <p className="clamp-2 mt-1 hidden text-[16px] leading-[20px] text-[var(--color-fg-secondary)] sm:block">
              {story.subtitle || story.excerpt}
            </p>
          </Link>

          <div className="mt-3 flex items-center justify-between sm:mt-6">
            <div className="flex items-center gap-3 text-[13px] text-[var(--color-fg-secondary)] sm:gap-5">
              {story.isMemberOnly && (
                <span title="Member-only story" aria-label="Member-only story" className="text-[var(--color-highlight)]">★</span>
              )}
              <ClapButton postId={story.id} initial={story.clapCount} compact />
              <Link href={`${href}#responses`} className="flex items-center gap-1.5 hover:text-[var(--color-fg)]">
                <IconComment size={18} /> {compactNumber(story.responseCount)}
              </Link>
              <button aria-label="Repost" className="hidden hover:text-[var(--color-fg)] sm:block"><IconRepost size={18} /></button>
            </div>
            <div className="flex items-center gap-3 text-[var(--color-fg-secondary)] sm:gap-4">
              <button aria-label="Show less like this" title="Show less like this" className="hidden hover:text-[var(--color-fg)] sm:block">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M7 4h9.5a2 2 0 0 1 2 1.6l1 5A2 2 0 0 1 17.5 13H13l.8 3.5a2 2 0 0 1-1.95 2.5L7 10.5V4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                  <path d="M4 4h3v6.5H4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                </svg>
              </button>
              <BookmarkButton postId={story.id} initial={story.saved ?? false} />
              <button aria-label="More options" className="hover:text-[var(--color-fg)]"><IconEllipsis size={20} /></button>
            </div>
          </div>
        </div>

        {story.coverImage && (
          <Link href={href} className="mt-1 shrink-0" tabIndex={-1} aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={story.coverImage} alt="" width={200} height={134} className="h-[76px] w-[76px] object-cover sm:h-[134px] sm:w-[200px]" />
          </Link>
        )}
      </div>
    </article>
  )
}
