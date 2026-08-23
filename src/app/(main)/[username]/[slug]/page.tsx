import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { Avatar } from '@/components/Avatar'
import { FollowButton } from '@/components/FollowButton'
import { StoryActionBar } from '@/components/StoryActionBar'
import { StoryBody } from '@/components/StoryBody'
import { Responses } from '@/components/Responses'
import { StoryFooter } from '@/components/StoryFooter'
import { StoryStickyBar } from '@/components/StoryStickyBar'
import { StoryToc } from '@/components/StoryToc'
import { StoryRecommendations } from '@/components/StoryRecommendations'
import { formatDate } from '@/lib/utils'

async function load(username: string, slug: string) {
  if (!username.startsWith('@')) return null
  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      author: { select: { id: true, name: true, username: true, avatarUrl: true, bio: true, isVerified: true } },
      publication: { select: { slug: true, name: true } },
      tags: { include: { tag: { select: { id: true, slug: true, name: true } } } },
      claps: { select: { count: true, userId: true } },
      _count: { select: { responses: true } },
    },
  })
  if (!post || post.author.username !== username.slice(1)) return null
  return post
}

export async function generateMetadata({
  params,
}: { params: Promise<{ username: string; slug: string }> }): Promise<Metadata> {
  const { username, slug } = await params
  const post = await load(decodeURIComponent(username), slug)
  if (!post) return { title: 'Not found' }
  return {
    title: post.title,
    description: post.subtitle ?? post.excerpt,
    openGraph: { title: post.title, description: post.subtitle ?? post.excerpt, type: 'article' },
  }
}

export default async function StoryPage({
  params,
}: { params: Promise<{ username: string; slug: string }> }) {
  const { username, slug } = await params
  const post = await load(decodeURIComponent(username), slug)
  if (!post || post.status !== 'PUBLISHED') notFound()

  const me = await getCurrentUser()
  const [isFollowing, saved, myHighlights] = await Promise.all([
    me ? prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: me.id, followingId: post.authorId } },
    }).then(Boolean) : Promise.resolve(false),
    me ? prisma.listItem.findFirst({ where: { postId: post.id, list: { userId: me.id } } }).then(Boolean) : Promise.resolve(false),
    me ? prisma.highlight.findMany({ where: { postId: post.id, userId: me.id } }) : Promise.resolve([]),
  ])

  // Record the read so it shows in reading history.
  if (me) {
    await prisma.readingHistory.upsert({
      where: { userId_postId: { userId: me.id, postId: post.id } },
      create: { userId: me.id, postId: post.id },
      update: { readAt: new Date() },
    })
  }

  const clapTotal = post.claps.reduce((n, c) => n + c.count, 0)
  const myClaps = me ? (post.claps.find((c) => c.userId === me.id)?.count ?? 0) : 0

  return (
    <main className="min-w-0 flex-1 px-6">
      <StoryStickyBar
        title={post.title}
        author={post.author}
        postId={post.id}
        clapTotal={clapTotal}
        myClaps={myClaps}
        responseCount={post._count.responses}
        saved={saved}
        signedIn={Boolean(me)}
      />
      <StoryToc />
      <article className="mx-auto w-full pt-12" style={{ maxWidth: 'var(--width-story)' }}>
        {post.tags.length > 0 && (
          <ul className="mb-6 flex flex-wrap gap-2">
            {post.tags.map(({ tag }) => (
              <li key={tag.slug}>
                <Link
                  href={`/tag/${tag.slug}`}
                  className="inline-block rounded-full bg-[var(--color-bg-secondary)] px-4 py-1.5 text-[13px] text-[var(--color-fg)] hover:bg-[var(--color-border-hover)]"
                >
                  {tag.name}
                </Link>
              </li>
            ))}
          </ul>
        )}

        <h1 className="text-[42px] font-bold leading-[52px] tracking-[-0.011em] text-[var(--color-fg)]">
          {post.title}
        </h1>
        {post.subtitle && (
          <p className="mt-2 text-[22px] leading-[28px] text-[var(--color-fg-secondary)]">{post.subtitle}</p>
        )}

        <div className="mt-8 flex items-center gap-4">
          <Avatar user={post.author} size={44} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-[14px]">
              {post.publication && (
                <>
                  <Link href={`/${post.publication.slug}`} className="text-[var(--color-fg)] hover:underline">{post.publication.name}</Link>
                  <span className="text-[var(--color-fg-secondary)]">·</span>
                </>
              )}
              <Link href={`/@${post.author.username}`} className="text-[var(--color-fg)] hover:underline">{post.author.name}</Link>
              {me && me.id !== post.authorId && (
                <>
                  <span className="text-[var(--color-fg-secondary)]">·</span>
                  <FollowButton userId={post.authorId} initial={isFollowing} />
                </>
              )}
            </div>
            <p className="mt-0.5 text-[14px] text-[var(--color-fg-secondary)]">
              {post.readingTime} min read
              {post.publishedAt && <> · {formatDate(post.publishedAt)}</>}
            </p>
          </div>
        </div>

        <StoryActionBar
          postId={post.id}
          slug={`/@${post.author.username}/${post.slug}`}
          title={post.title}
          clapTotal={clapTotal}
          myClaps={myClaps}
          responseCount={post._count.responses}
          saved={saved}
          signedIn={Boolean(me)}
          isAuthor={me?.id === post.authorId}
        />

        <StoryBody
          html={post.contentHtml}
          postId={post.id}
          signedIn={Boolean(me)}
          highlights={myHighlights.map((h) => ({ id: h.id, paraIndex: h.paraIndex, startOff: h.startOff, endOff: h.endOff }))}
        />

        <StoryFooter tags={post.tags.map((t) => t.tag)} author={post.author} isFollowing={isFollowing} showFollow={Boolean(me) && me?.id !== post.authorId} />
      </article>

      <div className="mx-auto w-full" style={{ maxWidth: 'var(--width-story)' }}>
        <Responses postId={post.id} signedIn={Boolean(me)} />
        <StoryRecommendations
          postId={post.id}
          authorId={post.authorId}
          tagIds={post.tags.map((t) => t.tag.id)}
        />
      </div>
    </main>
  )
}
