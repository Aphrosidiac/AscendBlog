import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { PageHeader } from '@/components/PageHeader'
import { MainColumn } from '@/components/PageColumns'
import { StoryCard } from '@/components/StoryCard'
import { NewListButton } from '@/components/NewListButton'
import { formatDate } from '@/lib/utils'
import { savedPostIds } from '@/lib/queries'

export const metadata: Metadata = { title: 'Your library' }

export default async function LibraryPage({
  searchParams,
}: { searchParams: Promise<{ tab?: string }> }) {
  const me = await getCurrentUser()
  if (!me) redirect('/signin')
  const { tab = 'lists' } = await searchParams

  const tabs = [
    { key: 'lists', label: 'Your lists', href: '/me/lists' },
    { key: 'saved', label: 'Saved lists', href: '/me/lists?tab=saved' },
    { key: 'highlights', label: 'Highlights', href: '/me/lists?tab=highlights' },
    { key: 'history', label: 'Reading history', href: '/me/lists?tab=history' },
    { key: 'responses', label: 'Responses', href: '/me/lists?tab=responses' },
  ]

  const saved = await savedPostIds(me.id)
  const storyInclude = {
    author: { select: { id: true, name: true, username: true, avatarUrl: true, isVerified: true } },
    publication: { select: { slug: true, name: true } },
    claps: { select: { count: true } },
    _count: { select: { responses: true } },
  } as const
  const toCard = (p: {
    id: string; slug: string; title: string; subtitle: string | null; excerpt: string
    coverImage: string | null; readingTime: number; publishedAt: Date | null; isMemberOnly: boolean
    author: { id: string; name: string; username: string; avatarUrl: string | null; isVerified: boolean }
    publication: { slug: string; name: string } | null
    claps: { count: number }[]; _count: { responses: number }
  }) => ({
    id: p.id, slug: p.slug, title: p.title, subtitle: p.subtitle, excerpt: p.excerpt,
    coverImage: p.coverImage, readingTime: p.readingTime, publishedAt: p.publishedAt,
    isMemberOnly: p.isMemberOnly, author: p.author, publication: p.publication,
    clapCount: p.claps.reduce((n, c) => n + c.count, 0),
    responseCount: p._count.responses,
    saved: saved.has(p.id),
  })

  const [lists, highlights, history, responses] = await Promise.all([
    tab === 'lists' || tab === 'saved'
      ? prisma.readingList.findMany({
          where: { userId: me.id },
          include: { _count: { select: { items: true } }, user: { select: { name: true, username: true } } },
          orderBy: { createdAt: 'desc' },
        })
      : Promise.resolve([]),
    tab === 'highlights'
      ? prisma.highlight.findMany({
          where: { userId: me.id },
          orderBy: { createdAt: 'desc' },
          include: { post: { select: { slug: true, title: true, author: { select: { username: true, name: true } } } } },
        })
      : Promise.resolve([]),
    tab === 'history'
      ? prisma.readingHistory.findMany({
          where: { userId: me.id },
          orderBy: { readAt: 'desc' },
          take: 30,
          include: { post: { include: storyInclude } },
        })
      : Promise.resolve([]),
    tab === 'responses'
      ? prisma.response.findMany({
          where: { authorId: me.id },
          orderBy: { createdAt: 'desc' },
          include: { post: { select: { slug: true, title: true, author: { select: { username: true } } } } },
        })
      : Promise.resolve([]),
  ])

  return (
    <MainColumn width={680}>
      <PageHeader title="Your library" active={tab} tabs={tabs} action={<NewListButton />} />

      {(tab === 'lists' || tab === 'saved') && (
        lists.length === 0 ? (
          <p className="py-12 text-[14px] text-[var(--color-fg-secondary)]">No lists yet.</p>
        ) : (
          <ul className="divide-y divide-[var(--color-border)]">
            {lists.map((l) => (
              <li key={l.id} className="py-6">
                <Link href={`/me/lists/${l.id}`} className="block">
                  <p className="text-[13px] text-[var(--color-fg-secondary)]">{l.user.name}</p>
                  <h2 className="mt-1 text-[20px] font-bold text-[var(--color-fg)]">{l.name}</h2>
                  <p className="mt-1 text-[13px] text-[var(--color-fg-secondary)]">
                    {l._count.items} {l._count.items === 1 ? 'story' : 'stories'}{l.isPrivate && ' 🔒'}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )
      )}

      {tab === 'highlights' && (
        highlights.length === 0 ? (
          <p className="py-12 text-[14px] text-[var(--color-fg-secondary)]">You haven&rsquo;t highlighted anything yet.</p>
        ) : (
          <ul className="divide-y divide-[var(--color-border)]">
            {highlights.map((h) => (
              <li key={h.id} className="py-6">
                <Link href={`/@${h.post.author.username}/${h.post.slug}`} className="text-[13px] text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)]">
                  {h.post.author.name} · {h.post.title}
                </Link>
                <blockquote className="mt-2 border-l-2 border-[var(--color-fg)] pl-4 font-[family-name:var(--font-serif)] text-[18px] leading-[28px] text-[var(--color-fg)]">
                  {h.text}
                </blockquote>
                <p className="mt-2 text-[13px] text-[var(--color-fg-secondary)]">{formatDate(h.createdAt)}</p>
              </li>
            ))}
          </ul>
        )
      )}

      {tab === 'history' && (
        history.length === 0 ? (
          <p className="py-12 text-[14px] text-[var(--color-fg-secondary)]">Nothing read yet.</p>
        ) : (
          history.map((h) => <StoryCard key={h.postId} story={toCard(h.post)} />)
        )
      )}

      {tab === 'responses' && (
        responses.length === 0 ? (
          <p className="py-12 text-[14px] text-[var(--color-fg-secondary)]">You haven&rsquo;t responded to anything yet.</p>
        ) : (
          <ul className="divide-y divide-[var(--color-border)]">
            {responses.map((r) => (
              <li key={r.id} className="py-6">
                <Link href={`/@${r.post.author.username}/${r.post.slug}#responses`} className="text-[13px] text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)]">
                  On {r.post.title}
                </Link>
                <div className="mt-2 text-[16px] leading-[24px] text-[var(--color-fg)]" dangerouslySetInnerHTML={{ __html: r.contentHtml }} />
                <p className="mt-2 text-[13px] text-[var(--color-fg-secondary)]">{formatDate(r.createdAt)}</p>
              </li>
            ))}
          </ul>
        )
      )}
    </MainColumn>
  )
}
