import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { guardWrites } from '@/lib/guard'

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const gate = await guardWrites()
  if (gate) return gate

  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await params
  const res = await prisma.response.findUnique({ where: { id }, select: { authorId: true } })
  if (!res) return NextResponse.json({ error: 'not found' }, { status: 404 })
  if (res.authorId !== user.id) return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  await prisma.response.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
