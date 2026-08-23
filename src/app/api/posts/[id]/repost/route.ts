import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { notify } from '@/lib/notify'
import { guardWrites } from '@/lib/guard'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const gate = await guardWrites()
  if (gate) return gate

  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await params
  const b = await req.json().catch(() => ({}))
  const comment = String(b?.comment ?? '').trim().slice(0, 500) || null

  const post = await prisma.post.findUnique({ where: { id }, select: { authorId: true } })
  if (!post) return NextResponse.json({ error: 'not found' }, { status: 404 })

  await prisma.repost.upsert({
    where: { userId_postId: { userId: user.id, postId: id } },
    create: { userId: user.id, postId: id, comment },
    update: { comment },
  })
  await notify({ userId: post.authorId, actorId: user.id, type: 'MENTION', postId: id })

  const count = await prisma.repost.count({ where: { postId: id } })
  return NextResponse.json({ reposted: true, count })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const gate = await guardWrites()
  if (gate) return gate

  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await params
  await prisma.repost.deleteMany({ where: { userId: user.id, postId: id } })
  const count = await prisma.repost.count({ where: { postId: id } })
  return NextResponse.json({ reposted: false, count })
}
