import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await params
  if (id === user.id) return NextResponse.json({ error: 'cannot mute yourself' }, { status: 400 })
  await prisma.mute.upsert({
    where: { muterId_mutedId: { muterId: user.id, mutedId: id } },
    create: { muterId: user.id, mutedId: id },
    update: {},
  })
  return NextResponse.json({ muted: true })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await params
  await prisma.mute.deleteMany({ where: { muterId: user.id, mutedId: id } })
  return NextResponse.json({ muted: false })
}
