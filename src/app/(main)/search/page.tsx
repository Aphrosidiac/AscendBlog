import Link from 'next/link'
import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { StoryCard } from '@/components/StoryCard'
import { MainColumn } from '@/components/PageColumns'
import { PageHeader } from '@/components/PageHeader'
import { Avatar } from '@/components/Avatar'
import { FollowButton } from '@/components/FollowButton'
import { savedPostIds } from '@/lib/queries'
import { compactNumber } from '@/lib/utils'

export const metadata: Metadata = { title: 'Search' }

export default async function SearchPage({
  searchParams,
}: { searchParams: Promise<{ q?: string; tab?: string }> }) {
  const { q = '', tab = 'stories' } = await searchParams
  const query = q.trim()
  const me = await getCurrentUser()
  const saved = await savedPostIds(me?.id)

  const like = { contains: query, mode: 'insensitive' as const }

  const [stories, people, publications, topics] = query
    ? await Promise.all([
        prisma.post.findMany({
          where: {
            status: 'PUBLISHED',
            OR: [{ title: like }, { subtitle: like }, { excerpt: like }, { contentHtml: like }],
          },
          orderBy: { publishedAt: 'desc' },
          take: 20,
          include: {
            author: { select: { id: true, name: true, username: true, avatarUrl: true, isVerified: true } },
            publication: { select: { slug: true, name: true } },
            claps: { select: { count: true } },
            _count: { select: { responses: true } },
          },
        }),
        prisma.user.findMany({
          where: { OR: [{ name: like }, { username: like }, { bio: like }] },
          take: 20,
          include: { _count: { select: { followers: true } } },
        }),
        prisma.publication.findMany({
          where: { OR: [{ name: like }, { tagline: like }, { description: like }] },
          take: 20,
        }),
        prisma.tag.findMany({
          where: { OR: [{ name: like }, { description: like }] },
          take: 20,
          include: { _count: { select: { posts: true } } },
        }),
      ])
    : [[], [], [], []]

  const tabs = [
    { key: 'stories', label: 'Stories', href: `/search?q=${encodeURIComponent(query)}` },
    { key: 'people', label: 'People', href: `/search?q=${encodeURIComponent(query)}&tab=people` },
    { key: 'publications', label: 'Publications', href: `/search?q=${encodeURIComponent(query)}&tab=publications` },
    { key: 'topics', label: 'Topics', href: `/search?q=${encodeURIComponent(query)}&tab=topics` },
  ]

  return (
    <MainColumn width={680}>
      <PageHeader
        title={query ? `Results for ${query}` : 'Search Ascend'}
        active={tab}
        tabs={query ? tabs : undefined}
      />

      {!query && (
        <p className="py-12 text-[14px] text-[var(--color-fg-secondary)]">
          Type in the search box above to find stories, people, publications, and topics.
        </p>
      )}

      {query && tab === 'stories' && (
        stories.length === 0
          ? <p className="py-12 text-[14px] text-[var(--color-fg-secondary)]">No stories matched.</p>
          : stories.map((p) => (
              <StoryCard
                key={p.id}
                story={{
                  id: p.id, slug: p.slug, title: p.title, subtitle: p.subtitle, excerpt: p.excerpt,
                  coverImage: p.coverImage, readingTime: p.readingTime, publishedAt: p.publishedAt,
                  isMemberOnly: p.isMemberOnly, author: p.author, publication: p.publication,
                  clapCount: p.claps.reduce((n, c) => n + c.count, 0),
                  responseCount: p._count.responses,
                  saved: saved.has(p.id),
                }}
              />
            ))
      )}

      {query && tab === 'people' && (
        people.length === 0
          ? <p className="py-12 text-[14px] text-[var(--color-fg-secondary)]">No people matched.</p>
          : <ul className="divide-y divide-[var(--color-border)]">
              {people.map((u) => (
                <li key={u.id} className="flex items-start gap-4 py-6">
                  <Avatar user={u} size={48} />
                  <div className="min-w-0 flex-1">
                    <Link href={`/@${u.username}`} className="text-[16px] font-bold text-[var(--color-fg)] hover:underline">{u.name}</Link>
                    {u.bio && <p className="clamp-2 mt-1 text-[14px] text-[var(--color-fg-secondary)]">{u.bio}</p>}
                    <p className="mt-1 text-[13px] text-[var(--color-fg-secondary)]">{compactNumber(u._count.followers)} followers</p>
                  </div>
                  {me && me.id !== u.id && <FollowButton userId={u.id} initial={false} />}
                </li>
              ))}
            </ul>
      )}

      {query && tab === 'publications' && (
        publications.length === 0
          ? <p className="py-12 text-[14px] text-[var(--color-fg-secondary)]">No publications matched.</p>
          : <ul className="divide-y divide-[var(--color-border)]">
              {publications.map((p) => (
                <li key={p.id} className="py-6">
                  <Link href={`/${p.slug}`} className="text-[16px] font-bold text-[var(--color-fg)] hover:underline">{p.name}</Link>
                  {p.tagline && <p className="mt-1 text-[14px] text-[var(--color-fg-secondary)]">{p.tagline}</p>}
                </li>
              ))}
            </ul>
      )}

      {query && tab === 'topics' && (
        topics.length === 0
          ? <p className="py-12 text-[14px] text-[var(--color-fg-secondary)]">No topics matched.</p>
          : <ul className="flex flex-wrap gap-2 py-6">
              {topics.map((t) => (
                <li key={t.id}>
                  <Link href={`/tag/${t.slug}`} className="inline-block rounded-full bg-[var(--color-bg-secondary)] px-4 py-2 text-[13px] text-[var(--color-fg)] hover:bg-[var(--color-border-hover)]">
                    {t.name} · {t._count.posts}
                  </Link>
                </li>
              ))}
            </ul>
      )}
    </MainColumn>
  )
}
