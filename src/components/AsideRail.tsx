import Link from 'next/link'
import { Avatar } from './Avatar'
import { FollowButton } from './FollowButton'
import { IconVerified } from './icons'
import { formatDate } from '@/lib/utils'
import { recommendedTopics, staffPicks, whoToFollow } from '@/lib/queries'

const FOOTER = [
  ['Help', '/help'], ['Status', '/status'], ['About', '/about'], ['Careers', '/careers'],
  ['Press', '/press'], ['Blog', '/blog'], ['Privacy', '/privacy'], ['Rules', '/rules'],
  ['Terms', '/terms'], ['Text to speech', '/text-to-speech'],
]

export async function AsideRail({ userId, showPicks = true }: { userId?: string; showPicks?: boolean }) {
  const [picks, topics, people] = await Promise.all([
    showPicks ? staffPicks(3, userId) : Promise.resolve([]),
    recommendedTopics(),
    whoToFollow(userId),
  ])

  return (
    <aside
      className="sticky hidden shrink-0 self-start border-l border-[var(--color-border)] px-6 pt-10 xl:block"
      style={{ width: 'var(--width-aside)', top: 'var(--height-header)' }}
    >
      {showPicks && picks.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-[16px] font-medium leading-[20px] text-[var(--color-fg)]">Staff Picks</h2>
          <ul className="space-y-5">
            {picks.map((p) => (
              <li key={p.slug}>
                <div className="mb-1 flex items-center gap-1.5 text-[13px] text-[var(--color-fg)]">
                  <Avatar user={p.author} size={20} />
                  {p.publication && (
                    <>
                      <span className="text-[var(--color-fg-secondary)]">In</span>
                      <Link href={`/${p.publication.slug}`} className="hover:underline">{p.publication.name}</Link>
                      <span className="text-[var(--color-fg-secondary)]">by</span>
                    </>
                  )}
                  <Link href={`/@${p.author.username}`} className="hover:underline">{p.author.name}</Link>
                  {p.author.isVerified && <IconVerified />}
                </div>
                <Link href={`/@${p.author.username}/${p.slug}`} className="block">
                  <h3 className="clamp-2 text-[14px] font-bold leading-[20px] text-[var(--color-fg)]">{p.title}</h3>
                </Link>
                <p className="mt-1 flex items-center gap-1.5 text-[13px] text-[var(--color-fg-secondary)]">
                  {p.isMemberOnly && <span className="text-[var(--color-highlight)]">★</span>}
                  {p.publishedAt ? formatDate(p.publishedAt) : ''}
                </p>
              </li>
            ))}
          </ul>
          <Link href="/explore" className="mt-4 inline-block text-[13px] text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)]">
            See the full list
          </Link>
        </section>
      )}

      <section className="mb-10">
        <h2 className="mb-4 text-[16px] font-medium leading-[20px] text-[var(--color-fg)]">Recommended topics</h2>
        <ul className="flex flex-wrap gap-2">
          {topics.map((t) => (
            <li key={t.slug}>
              <Link
                href={`/tag/${t.slug}`}
                className="inline-block rounded-full bg-[var(--color-bg-secondary)] px-4 py-2 text-[13px] text-[var(--color-fg)] transition-colors hover:bg-[var(--color-border-hover)]"
              >
                {t.name}
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/explore/topics" className="mt-4 inline-block text-[13px] text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)]">
          See more topics
        </Link>
      </section>

      {people.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-[16px] font-medium leading-[20px] text-[var(--color-fg)]">Who to follow</h2>
          <ul className="space-y-4">
            {people.map((p) => (
              <li key={p.id} className="flex items-start gap-2">
                <Avatar user={p} size={32} />
                <div className="min-w-0 flex-1">
                  <Link href={`/@${p.username}`} className="flex items-center gap-1 text-[14px] font-medium text-[var(--color-fg)] hover:underline">
                    <span className="clamp-1">{p.name}</span>
                    {p.isVerified && <IconVerified />}
                  </Link>
                  <p className="clamp-2 text-[13px] text-[var(--color-fg-secondary)]">{p.bio}</p>
                </div>
                <FollowButton userId={p.id} initial={false} />
              </li>
            ))}
          </ul>
          <Link href="/explore/people" className="mt-4 inline-block text-[13px] text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)]">
            See more suggestions
          </Link>
        </section>
      )}

      <nav className="flex flex-wrap gap-x-3 gap-y-2 pb-10 text-[13px] text-[var(--color-fg-secondary)]">
        {FOOTER.map(([label, href]) => (
          <Link key={label} href={href} className="hover:text-[var(--color-fg)]">{label}</Link>
        ))}
      </nav>
    </aside>
  )
}
