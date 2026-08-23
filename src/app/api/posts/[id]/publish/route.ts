import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { notify } from '@/lib/notify'
import { slugify } from '@/lib/utils'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await params

  const post = await prisma.post.findUnique({
    where: { id },
    select: { authorId: true, title: true, status: true, publishedAt: true, contentHtml: true },
  })
  if (!post) return NextResponse.json({ error: 'not found' }, { status: 404 })
  if (post.authorId !== user.id) return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  if (!post.title.trim()) return NextResponse.json({ error: 'Add a title before publishing.' }, { status: 400 })

  const b = await req.json().catch(() => ({}))
  const tagSlugs: string[] = Array.isArray(b?.tags) ? b.tags.slice(0, 5).map(String) : []
  const isMemberOnly = Boolean(b?.isMemberOnly)

  const tags = await prisma.tag.findMany({ where: { slug: { in: tagSlugs } }, select: { id: true } })

  const firstPublish = post.status !== 'PUBLISHED'
  const updated = await prisma.post.update({
    where: { id },
    data: {
      status: 'PUBLISHED',
      isMemberOnly,
      publishedAt: post.publishedAt ?? new Date(),
      slug: slugify(post.title, id),
      tags: { deleteMany: {}, create: tags.map((t) => ({ tagId: t.id })) },
    },
    select: { slug: true, author: { select: { username: true } } },
  })

  // Tell this author's followers, but only the first time it goes live.
  if (firstPublish) {
    const followers = await prisma.follow.findMany({
      where: { followingId: user.id },
      select: { followerId: true },
    })
    for (const f of followers) {
      await notify({ userId: f.followerId, actorId: user.id, type: 'PUBLISHED', postId: id })
    }
  }

  return NextResponse.json({ path: `/@${updated.author.username}/${updated.slug}` })
}
