import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { notify } from '@/lib/notify'
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

  const post = await prisma.post.findUnique({ where: { id }, select: { id: true, authorId: true } })
  if (!post) return NextResponse.json({ error: 'not found' }, { status: 404 })

  if (count === 0) {
    await prisma.clap.deleteMany({ where: { userId: user.id, postId: id } })
  } else {
    await prisma.clap.upsert({
      where: { userId_postId: { userId: user.id, postId: id } },
      create: { userId: user.id, postId: id, count },
      update: { count },
    })
    if (post.authorId !== user.id) {
      await notify({ userId: post.authorId, actorId: user.id, type: 'CLAP', postId: id })
    }
  }

  const total = await prisma.clap.aggregate({ where: { postId: id }, _sum: { count: true } })
  return NextResponse.json({ total: total._sum.count ?? 0, mine: count })
}
