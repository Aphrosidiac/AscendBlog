import Link from 'next/link'
import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { MainColumn } from '@/components/PageColumns'
import { PageHeader } from '@/components/PageHeader'
import { Avatar } from '@/components/Avatar'
import { FollowButton } from '@/components/FollowButton'
import { compactNumber } from '@/lib/utils'

export const metadata: Metadata = { title: 'Explore' }

export default async function ExplorePage() {
  const me = await getCurrentUser()
  const [topics, people, pubs, following] = await Promise.all([
    prisma.tag.findMany({ include: { _count: { select: { posts: true } } }, orderBy: { name: 'asc' } }),
    prisma.user.findMany({
      where: me ? { id: { not: me.id } } : {},
      include: { _count: { select: { followers: true } } },
      take: 12,
    }),
    prisma.publication.findMany({ take: 6 }),
    me ? prisma.follow.findMany({ where: { followerId: me.id }, select: { followingId: true } }) : Promise.resolve([]),
  ])
  const followingIds = new Set(following.map((f) => f.followingId))

  return (
    <MainColumn width={680}>
      <PageHeader title="Explore" />

      <section className="mt-10">
        <h2 className="text-[16px] font-bold text-[var(--color-fg)]">Topics</h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {topics.map((t) => (
            <li key={t.id}>
              <Link href={`/tag/${t.slug}`} className="inline-block rounded-full bg-[var(--color-bg-secondary)] px-4 py-2 text-[13px] text-[var(--color-fg)] hover:bg-[var(--color-border-hover)]">
                {t.name} · {t._count.posts}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-[16px] font-bold text-[var(--color-fg)]">People to follow</h2>
        <ul className="mt-4 divide-y divide-[var(--color-border)]">
          {people.map((u) => (
            <li key={u.id} className="flex items-start gap-4 py-5">
              <Avatar user={u} size={48} />
              <div className="min-w-0 flex-1">
                <Link href={`/@${u.username}`} className="text-[16px] font-bold text-[var(--color-fg)] hover:underline">{u.name}</Link>
                {u.bio && <p className="clamp-2 mt-1 text-[14px] text-[var(--color-fg-secondary)]">{u.bio}</p>}
                <p className="mt-1 text-[13px] text-[var(--color-fg-secondary)]">{compactNumber(u._count.followers)} followers</p>
              </div>
              {me && <FollowButton userId={u.id} initial={followingIds.has(u.id)} />}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12 pb-16">
        <h2 className="text-[16px] font-bold text-[var(--color-fg)]">Publications</h2>
        <ul className="mt-4 divide-y divide-[var(--color-border)]">
          {pubs.map((p) => (
            <li key={p.id} className="py-5">
              <Link href={`/${p.slug}`} className="text-[16px] font-bold text-[var(--color-fg)] hover:underline">{p.name}</Link>
              {p.tagline && <p className="mt-1 text-[14px] text-[var(--color-fg-secondary)]">{p.tagline}</p>}
            </li>
          ))}
        </ul>
      </section>
    </MainColumn>
  )
}
