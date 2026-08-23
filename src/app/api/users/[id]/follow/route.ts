import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { notify } from '@/lib/notify'
import { guardWrites } from '@/lib/guard'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const gate = await guardWrites()
  if (gate) return gate

  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await params
  if (id === user.id) return NextResponse.json({ error: 'cannot follow yourself' }, { status: 400 })

  await prisma.follow.upsert({
    where: { followerId_followingId: { followerId: user.id, followingId: id } },
    create: { followerId: user.id, followingId: id },
    update: {},
  })
  await notify({ userId: id, actorId: user.id, type: 'FOLLOW' })
  return NextResponse.json({ following: true })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const gate = await guardWrites()
  if (gate) return gate

  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await params
  await prisma.follow.deleteMany({ where: { followerId: user.id, followingId: id } })
  return NextResponse.json({ following: false })
}
