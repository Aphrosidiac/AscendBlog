import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { guardWrites } from '@/lib/guard'

/** "Show less like this" — the story drops out of this reader's feed. */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const gate = await guardWrites()
  if (gate) return gate

  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await params
  const post = await prisma.post.findUnique({ where: { id }, select: { id: true } })
  if (!post) return NextResponse.json({ error: 'not found' }, { status: 404 })
  await prisma.notInterested.upsert({
    where: { userId_postId: { userId: user.id, postId: id } },
    create: { userId: user.id, postId: id },
    update: {},
  })
  return NextResponse.json({ hidden: true })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const gate = await guardWrites()
  if (gate) return gate

  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await params
  await prisma.notInterested.deleteMany({ where: { userId: user.id, postId: id } })
  return NextResponse.json({ hidden: false })
}
