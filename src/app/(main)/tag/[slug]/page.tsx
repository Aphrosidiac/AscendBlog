import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { StoryCard } from '@/components/StoryCard'
import { TagFollowButton } from '@/components/TagFollowButton'
import { savedPostIds } from '@/lib/queries'
import { compactNumber } from '@/lib/utils'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const tag = await prisma.tag.findUnique({ where: { slug }, select: { name: true, description: true } })
  return tag ? { title: tag.name, description: tag.description ?? undefined } : { title: 'Topic not found' }
}

export default async function TagPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const tag = await prisma.tag.findUnique({
    where: { slug },
    include: { _count: { select: { posts: true, followers: true } } },
  })
  if (!tag) notFound()

  const me = await getCurrentUser()
  const [following, saved, allTags] = await Promise.all([
    me ? prisma.tagFollow.findUnique({ where: { userId_tagId: { userId: me.id, tagId: tag.id } } }).then(Boolean) : Promise.resolve(false),
    savedPostIds(me?.id),
    prisma.tag.findMany({ select: { slug: true, name: true }, orderBy: { name: 'asc' } }),
  ])

  const posts = await prisma.post.findMany({
    where: { status: 'PUBLISHED', tags: { some: { tagId: tag.id } } },
    orderBy: { publishedAt: 'desc' },
    include: {
      author: { select: { id: true, name: true, username: true, avatarUrl: true, isVerified: true } },
      publication: { select: { slug: true, name: true } },
      claps: { select: { count: true } },
      _count: { select: { responses: true } },
    },
  })

  return (
    <main className="min-w-0 flex-1 px-6">
      <nav className="mx-auto flex w-full gap-2 overflow-x-auto pt-6 no-scrollbar" style={{ maxWidth: 1000 }}>
        <Link href="/explore" className="shrink-0 rounded-full border border-[var(--color-border-mid)] px-4 py-2 text-[13px] text-[var(--color-fg)] hover:border-[var(--color-fg)]">
          Explore topics
        </Link>
        {allTags.map((t) => (
          <Link
            key={t.slug}
            href={`/tag/${t.slug}`}
            className={`shrink-0 rounded-full px-4 py-2 text-[13px] transition-colors ${
              t.slug === slug
                ? 'border border-[var(--color-fg)] text-[var(--color-fg)]'
                : 'bg-[var(--color-bg-secondary)] text-[var(--color-fg)] hover:bg-[var(--color-border-hover)]'
            }`}
          >
            {t.name}
          </Link>
        ))}
      </nav>

      <header className="mx-auto mt-12 w-full text-center" style={{ maxWidth: 680 }}>
        <h1 className="text-[42px] font-bold leading-[52px] tracking-[-0.011em] text-[var(--color-fg)]">{tag.name}</h1>
        <p className="mt-3 text-[14px] text-[var(--color-fg-secondary)]">
          Topic · {compactNumber(tag._count.followers)} followers · {compactNumber(tag._count.posts)} stories
        </p>
        {tag.description && (
          <p className="mx-auto mt-3 max-w-[520px] text-[14px] leading-[22px] text-[var(--color-fg-secondary)]">
            {tag.description}
          </p>
        )}
        <div className="mt-6 flex items-center justify-center gap-3">
          {me ? <TagFollowButton tagId={tag.id} initial={following} /> : (
            <Link href="/signin" className="rounded-full bg-[var(--color-bg-brand)] px-4 py-2 text-[14px] text-[var(--color-fg-inverse)]">Follow</Link>
          )}
        </div>
      </header>

      <div className="mx-auto mt-12 w-full border-t border-[var(--color-border)]" style={{ maxWidth: 680 }}>
        <h2 className="pt-10 text-[20px] font-bold text-[var(--color-fg)]">Recommended stories</h2>
        {posts.length === 0 ? (
          <p className="py-12 text-[14px] text-[var(--color-fg-secondary)]">No stories in this topic yet.</p>
        ) : (
          posts.map((p) => (
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
      </div>
    </main>
  )
}
