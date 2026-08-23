import Link from 'next/link'
import { prisma } from '@/lib/db'
import { Avatar } from './Avatar'
import { IconVerified } from './icons'
import { compactNumber, formatDate } from '@/lib/utils'

/** "More from the author" + "Recommended from Ascend", as at the foot of a story. */
export async function StoryRecommendations({
  postId, authorId, tagIds,
}: { postId: string; authorId: string; tagIds: string[] }) {
  const [more, recommended] = await Promise.all([
    prisma.post.findMany({
      where: { authorId, status: 'PUBLISHED', id: { not: postId } },
      orderBy: { publishedAt: 'desc' },
      take: 4,
      include: {
        author: { select: { name: true, username: true, avatarUrl: true, isVerified: true } },
        claps: { select: { count: true } },
      },
    }),
    prisma.post.findMany({
      where: {
        status: 'PUBLISHED',
        id: { not: postId },
        authorId: { not: authorId },
        ...(tagIds.length ? { tags: { some: { tagId: { in: tagIds } } } } : {}),
      },
      orderBy: { publishedAt: 'desc' },
      take: 4,
      include: {
        author: { select: { name: true, username: true, avatarUrl: true, isVerified: true } },
        publication: { select: { slug: true, name: true } },
        claps: { select: { count: true } },
      },
    }),
  ])

  const Card = ({ p }: {
    p: {
      slug: string; title: string; subtitle: string | null; publishedAt: Date | null
      coverImage: string | null; readingTime: number
      author: { name: string; username: string; avatarUrl: string | null; isVerified: boolean }
      publication?: { slug: string; name: string } | null
      claps: { count: number }[]
    }
  }) => (
    <article>
      <div className="mb-2 flex items-center gap-2 text-[13px] text-[var(--color-fg)]">
        <Avatar user={p.author} size={20} />
        <Link href={`/@${p.author.username}`} className="hover:underline">{p.author.name}</Link>
        {p.author.isVerified && <IconVerified />}
      </div>
      <Link href={`/@${p.author.username}/${p.slug}`} className="block">
        <h3 className="clamp-2 text-[16px] font-bold leading-[20px] text-[var(--color-fg)]">{p.title}</h3>
        {p.subtitle && <p className="clamp-2 mt-1 text-[14px] leading-[20px] text-[var(--color-fg-secondary)]">{p.subtitle}</p>}
      </Link>
      <p className="mt-2 text-[13px] text-[var(--color-fg-secondary)]">
        {p.publishedAt ? formatDate(p.publishedAt) : ''} · {compactNumber(p.claps.reduce((n, c) => n + c.count, 0))} claps
      </p>
    </article>
  )

  if (more.length === 0 && recommended.length === 0) return null

  return (
    <div className="border-t border-[var(--color-border)] py-12">
      {more.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-6 text-[16px] font-bold text-[var(--color-fg)]">
            More from {more[0].author.name}
          </h2>
          <div className="grid gap-8 sm:grid-cols-2">
            {more.map((p) => <Card key={p.slug} p={p} />)}
          </div>
        </section>
      )}

      {recommended.length > 0 && (
        <section>
          <h2 className="mb-6 text-[16px] font-bold text-[var(--color-fg)]">Recommended from Ascend</h2>
          <div className="grid gap-8 sm:grid-cols-2">
            {recommended.map((p) => <Card key={p.slug} p={p} />)}
          </div>
        </section>
      )}
    </div>
  )
}
