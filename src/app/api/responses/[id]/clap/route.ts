import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { guardWrites } from '@/lib/guard'

const MAX = 50

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const gate = await guardWrites()
  if (gate) return gate

  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const count = Math.max(0, Math.min(MAX, Number(body?.count) || 0))

  if (count === 0) {
    await prisma.clap.deleteMany({ where: { userId: user.id, responseId: id } })
  } else {
    await prisma.clap.upsert({
      where: { userId_responseId: { userId: user.id, responseId: id } },
      create: { userId: user.id, responseId: id, count },
      update: { count },
    })
  }
  const total = await prisma.clap.aggregate({ where: { responseId: id }, _sum: { count: true } })
  return NextResponse.json({ total: total._sum.count ?? 0, mine: count })
}
