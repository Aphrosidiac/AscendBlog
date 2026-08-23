import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

/** Which of my lists contain this story (used by the save popover). */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await params

  const lists = await prisma.readingList.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'asc' },
    select: { id: true, name: true, isPrivate: true, items: { where: { postId: id }, select: { postId: true } } },
  })

  return NextResponse.json({
    lists: lists.map((l) => ({ id: l.id, name: l.name, isPrivate: l.isPrivate, contains: l.items.length > 0 })),
  })
}

/** Toggle this story in one specific list. */
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await params
  const b = await req.json().catch(() => ({}))
  const listId = String(b?.listId ?? '')
  const add = Boolean(b?.add)

  // Never let one user write into another user's list.
  const list = await prisma.readingList.findFirst({ where: { id: listId, userId: user.id }, select: { id: true } })
  if (!list) return NextResponse.json({ error: 'not found' }, { status: 404 })

  if (add) {
    await prisma.listItem.upsert({
      where: { listId_postId: { listId, postId: id } },
      create: { listId, postId: id },
      update: {},
    })
  } else {
    await prisma.listItem.deleteMany({ where: { listId, postId: id } })
  }

  const anywhere = await prisma.listItem.count({ where: { postId: id, list: { userId: user.id } } })
  return NextResponse.json({ contains: add, savedAnywhere: anywhere > 0 })
}
