import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { Avatar } from '@/components/Avatar'
import { FollowButton } from '@/components/FollowButton'
import { StoryCard } from '@/components/StoryCard'
import { IconVerified } from '@/components/icons'
import { savedPostIds } from '@/lib/queries'
import { compactNumber, formatDate } from '@/lib/utils'
import { PublicationPage } from '@/components/PublicationPage'

type Params = Promise<{ username: string }>
type Search = Promise<{ tab?: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { username } = await params
  const handle = decodeURIComponent(username)
  if (!handle.startsWith('@')) {
    const pub = await prisma.publication.findUnique({ where: { slug: handle }, select: { name: true, tagline: true } })
    return pub ? { title: pub.name, description: pub.tagline ?? undefined } : { title: 'Not found' }
  }
  const user = await prisma.user.findUnique({ where: { username: handle.slice(1) }, select: { name: true, bio: true } })
  return user ? { title: user.name, description: user.bio ?? undefined } : { title: 'Not found' }
}

export default async function ProfilePage({ params, searchParams }: { params: Params; searchParams: Search }) {
  const { username } = await params
  const { tab = 'home' } = await searchParams
  const handle = decodeURIComponent(username)

  // Anything without an @ is a publication slug.
  if (!handle.startsWith('@')) return <PublicationPage slug={handle} />

  const profile = await prisma.user.findUnique({
    where: { username: handle.slice(1) },
    include: { _count: { select: { followers: true, following: true, posts: true } } },
  })
  if (!profile) notFound()

  const me = await getCurrentUser()
  const isMe = me?.id === profile.id
  const [isFollowing, saved] = await Promise.all([
    me && !isMe
      ? prisma.follow.findUnique({ where: { followerId_followingId: { followerId: me.id, followingId: profile.id } } }).then(Boolean)
      : Promise.resolve(false),
    savedPostIds(me?.id),
  ])

  const posts = await prisma.post.findMany({
    where: { authorId: profile.id, status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' },
    include: {
      author: { select: { id: true, name: true, username: true, avatarUrl: true, isVerified: true } },
      publication: { select: { slug: true, name: true } },
      claps: { select: { count: true } },
      _count: { select: { responses: true } },
    },
  })

  const lists = tab === 'lists'
    ? await prisma.readingList.findMany({
        where: { userId: profile.id, ...(isMe ? {} : { isPrivate: false }) },
        include: { _count: { select: { items: true } } },
        orderBy: { createdAt: 'desc' },
      })
    : []

  const tabs = [
    { key: 'home', label: 'Home' },
    { key: 'lists', label: 'Lists' },
    { key: 'about', label: 'About' },
  ]

  return (
    <>
      <main className="min-w-0 flex-1 px-6">
        <div className="mx-auto w-full pt-14" style={{ maxWidth: 680 }}>
          <div className="flex items-start justify-between gap-6">
            <h1 className="flex items-center gap-3 text-[42px] font-medium leading-[52px] tracking-[-0.011em] text-[var(--color-fg)]">
              {profile.name}
              {profile.isVerified && <IconVerified />}
            </h1>
          </div>

          <nav className="mt-10 flex gap-8 border-b border-[var(--color-border)]">
            {tabs.map((t) => (
              <Link
                key={t.key}
                href={t.key === 'home' ? `/${handle}` : `/${handle}?tab=${t.key}`}
                className={`whitespace-nowrap border-b py-4 text-[14px] transition-colors ${
                  tab === t.key
                    ? 'border-[var(--color-fg)] text-[var(--color-fg)]'
                    : 'border-transparent text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)]'
                }`}
              >
                {t.label}
              </Link>
            ))}
          </nav>

          {tab === 'home' && (
            posts.length === 0 ? (
              <p className="py-16 text-[14px] text-[var(--color-fg-secondary)]">No stories published yet.</p>
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
            )
          )}

          {tab === 'lists' && (
            lists.length === 0 ? (
              <p className="py-16 text-[14px] text-[var(--color-fg-secondary)]">No lists yet.</p>
            ) : (
              <ul className="divide-y divide-[var(--color-border)]">
                {lists.map((l) => (
                  <li key={l.id} className="py-6">
                    <Link href={`/me/lists/${l.id}`} className="block">
                      <h2 className="text-[20px] font-bold text-[var(--color-fg)]">{l.name}</h2>
                      <p className="mt-1 text-[13px] text-[var(--color-fg-secondary)]">
                        {l._count.items} {l._count.items === 1 ? 'story' : 'stories'}
                        {l.isPrivate && ' · Private'}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )
          )}

          {tab === 'about' && (
            <div className="py-10 text-[16px] leading-[28px] text-[var(--color-fg)]">
              {profile.about ? <p>{profile.about}</p> : (
                <p className="text-[var(--color-fg-secondary)]">Nothing here yet.</p>
              )}
              <p className="mt-8 text-[13px] text-[var(--color-fg-secondary)]">
                Joined {formatDate(profile.createdAt)}
              </p>
            </div>
          )}
        </div>
      </main>

      <aside
        className="sticky hidden shrink-0 self-start border-l border-[var(--color-border)] px-6 pt-14 xl:block"
        style={{ width: 'var(--width-aside)', top: 'var(--height-header)' }}
      >
        <Avatar user={profile} size={88} href={null} />
        <h2 className="mt-4 flex items-center gap-2 text-[16px] font-bold text-[var(--color-fg)]">
          {profile.name}
          {profile.isVerified && <IconVerified />}
        </h2>
        <p className="mt-1 text-[13px] text-[var(--color-fg-secondary)]">
          <Link href={`/${handle}/followers`} className="hover:text-[var(--color-fg)]">
            {compactNumber(profile._count.followers)} followers
          </Link>
          {' · '}
          <Link href={`/${handle}/following`} className="hover:text-[var(--color-fg)]">
            {compactNumber(profile._count.following)} following
          </Link>
        </p>
        {profile.bio && <p className="mt-3 text-[13px] leading-[20px] text-[var(--color-fg-secondary)]">{profile.bio}</p>}
        <div className="mt-4">
          {isMe ? (
            <Link href="/me/settings" className="text-[13px] text-[var(--color-fg-accent)] hover:underline">Edit profile</Link>
          ) : me ? (
            <FollowButton userId={profile.id} initial={isFollowing} size="md" />
          ) : (
            <Link href="/signin" className="inline-block rounded-full bg-[var(--color-bg-brand)] px-4 py-2 text-[14px] text-[var(--color-fg-inverse)]">Follow</Link>
          )}
        </div>
      </aside>
    </>
  )
}
