import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { guardWrites } from '@/lib/guard'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const gate = await guardWrites()
  if (gate) return gate

  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await params
  await prisma.tagFollow.upsert({
    where: { userId_tagId: { userId: user.id, tagId: id } },
    create: { userId: user.id, tagId: id },
    update: {},
  })
  return NextResponse.json({ following: true })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const gate = await guardWrites()
  if (gate) return gate

  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await params
  await prisma.tagFollow.deleteMany({ where: { userId: user.id, tagId: id } })
  return NextResponse.json({ following: false })
}
