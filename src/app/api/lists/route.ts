import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { guardWrites } from '@/lib/guard'

export async function POST(req: Request) {
  const gate = await guardWrites()
  if (gate) return gate

  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const b = await req.json().catch(() => ({}))
  const name = String(b?.name ?? '').trim().slice(0, 120)
  if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })
  const list = await prisma.readingList.create({
    data: { userId: user.id, name, isPrivate: Boolean(b?.isPrivate) },
    select: { id: true },
  })
  return NextResponse.json(list, { status: 201 })
}
