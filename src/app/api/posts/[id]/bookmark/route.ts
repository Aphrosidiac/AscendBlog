import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { guardWrites } from '@/lib/guard'

/** Saving with no list chosen drops the story into the user's default Reading list. */
async function defaultList(userId: string) {
  const existing = await prisma.readingList.findFirst({
    where: { userId, name: 'Reading list' },
    select: { id: true },
  })
  if (existing) return existing.id
  const created = await prisma.readingList.create({
    data: { userId, name: 'Reading list', isPrivate: true },
    select: { id: true },
  })
  return created.id
}

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const gate = await guardWrites()
  if (gate) return gate

  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await params
  const listId = await defaultList(user.id)
  await prisma.listItem.upsert({
    where: { listId_postId: { listId, postId: id } },
    create: { listId, postId: id },
    update: {},
  })
  return NextResponse.json({ saved: true })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const gate = await guardWrites()
  if (gate) return gate

  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await params
  await prisma.listItem.deleteMany({ where: { postId: id, list: { userId: user.id } } })
  return NextResponse.json({ saved: false })
}
