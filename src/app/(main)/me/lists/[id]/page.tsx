import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { MainColumn } from '@/components/PageColumns'
import { StoryCard } from '@/components/StoryCard'
import { savedPostIds } from '@/lib/queries'
import { formatDate } from '@/lib/utils'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const list = await prisma.readingList.findUnique({ where: { id }, select: { name: true } })
  return { title: list?.name ?? 'List' }
}

export default async function ListPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const me = await getCurrentUser()

  const list = await prisma.readingList.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, username: true, avatarUrl: true } },
      items: {
        orderBy: { addedAt: 'desc' },
        include: {
          post: {
            include: {
              author: { select: { id: true, name: true, username: true, avatarUrl: true, isVerified: true } },
              publication: { select: { slug: true, name: true } },
              claps: { select: { count: true } },
              _count: { select: { responses: true } },
            },
          },
        },
      },
    },
  })
  if (!list) notFound()
  // A private list is only ever visible to its owner.
  if (list.isPrivate && list.userId !== me?.id) {
    if (!me) redirect('/signin')
    notFound()
  }

  const saved = await savedPostIds(me?.id)

  return (
    <MainColumn width={680}>
      <div className="pt-14">
        <p className="text-[13px] text-[var(--color-fg-secondary)]">{list.user.name}</p>
        <h1 className="mt-2 text-[42px] font-bold leading-[52px] tracking-[-0.011em] text-[var(--color-fg)]">{list.name}</h1>
        <p className="mt-2 text-[13px] text-[var(--color-fg-secondary)]">
          {list.items.length} {list.items.length === 1 ? 'story' : 'stories'}
          {list.isPrivate && ' · Private'} · Created {formatDate(list.createdAt)}
        </p>
      </div>

      <div className="mt-8 border-t border-[var(--color-border)]">
        {list.items.length === 0 ? (
          <p className="py-12 text-[14px] text-[var(--color-fg-secondary)]">
            Nothing saved here yet. Use the bookmark icon on any story to add it.
          </p>
        ) : (
          list.items.map(({ post: p }) => (
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
    </MainColumn>
  )
}
