import { prisma } from './db'
import type { FeedStory } from '@/components/StoryCard'

const cardSelect = {
  id: true, slug: true, title: true, subtitle: true, excerpt: true,
  coverImage: true, readingTime: true, publishedAt: true, isMemberOnly: true,
  author: { select: { id: true, name: true, username: true, avatarUrl: true } },
  publication: { select: { slug: true, name: true } },
  _count: { select: { responses: true } },
  claps: { select: { count: true } },
} as const

type Row = {
  id: string; slug: string; title: string; subtitle: string | null; excerpt: string
  coverImage: string | null; readingTime: number; publishedAt: Date | null; isMemberOnly: boolean
  author: { id: string; name: string; username: string; avatarUrl: string | null }
  publication: { slug: string; name: string } | null
  _count: { responses: number }
  claps: { count: number }[]
}

function toCard(p: Row, savedIds?: Set<string>): FeedStory {
  return {
    id: p.id, slug: p.slug, title: p.title, subtitle: p.subtitle, excerpt: p.excerpt,
    coverImage: p.coverImage, readingTime: p.readingTime, publishedAt: p.publishedAt,
    isMemberOnly: p.isMemberOnly, author: p.author, publication: p.publication,
    clapCount: p.claps.reduce((n, c) => n + c.count, 0),
    responseCount: p._count.responses,
    saved: savedIds?.has(p.id) ?? false,
  }
}

export async function savedPostIds(userId?: string) {
  if (!userId) return new Set<string>()
  const items = await prisma.listItem.findMany({
    where: { list: { userId } }, select: { postId: true },
  })
  return new Set(items.map((i) => i.postId))
}

/** "For you": stories from people and tags you follow, newest first, then everything else. */
export async function forYouFeed(userId?: string, take = 20) {
  const saved = await savedPostIds(userId)
  if (!userId) {
    const rows = await prisma.post.findMany({
      where: { status: 'PUBLISHED' }, orderBy: { publishedAt: 'desc' }, take, select: cardSelect,
    })
    return rows.map((r) => ({ story: toCard(r as Row, saved), reason: undefined as string | undefined }))
  }

  const [follows, tagFollows] = await Promise.all([
    prisma.follow.findMany({ where: { followerId: userId }, select: { followingId: true } }),
    prisma.tagFollow.findMany({ where: { userId }, select: { tag: { select: { id: true, name: true } } } }),
  ])
  const authorIds = follows.map((f) => f.followingId)
  const tagIds = tagFollows.map((t) => t.tag.id)
  const tagName = new Map(tagFollows.map((t) => [t.tag.id, t.tag.name]))

  const rows = await prisma.post.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' },
    take,
    select: { ...cardSelect, tags: { select: { tagId: true } } },
  })

  return rows.map((r) => {
    const followedTag = r.tags.find((t) => tagIds.includes(t.tagId))
    const reason = authorIds.includes(r.author.id)
      ? undefined
      : followedTag
        ? `Because you follow ${tagName.get(followedTag.tagId)}`
        : undefined
    return { story: toCard(r as Row, saved), reason }
  })
}

/** "Featured": ranked by total claps rather than recency. */
export async function featuredFeed(userId?: string, take = 20) {
  const saved = await savedPostIds(userId)
  const rows = await prisma.post.findMany({
    where: { status: 'PUBLISHED' }, take: 60, select: cardSelect,
  })
  return (rows as Row[])
    .map((r) => toCard(r, saved))
    .sort((a, b) => b.clapCount - a.clapCount)
    .slice(0, take)
    .map((story) => ({ story, reason: undefined as string | undefined }))
}

export async function staffPicks(take = 3) {
  const rows = await prisma.post.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' },
    take,
    select: {
      slug: true, title: true, publishedAt: true, isMemberOnly: true,
      author: { select: { name: true, username: true, avatarUrl: true, isVerified: true } },
      publication: { select: { slug: true, name: true } },
    },
  })
  return rows
}

export async function recommendedTopics(take = 7) {
  return prisma.tag.findMany({ take, select: { slug: true, name: true } })
}

export async function whoToFollow(userId?: string, take = 3) {
  const following = userId
    ? (await prisma.follow.findMany({ where: { followerId: userId }, select: { followingId: true } })).map((f) => f.followingId)
    : []
  return prisma.user.findMany({
    where: { id: { notIn: [...following, ...(userId ? [userId] : [])] } },
    take,
    select: { id: true, name: true, username: true, avatarUrl: true, bio: true, isVerified: true },
  })
}
