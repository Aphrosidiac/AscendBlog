import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

const REASONS = ['spam', 'harassment', 'misinformation', 'plagiarism', 'other'] as const

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await params
  const b = await req.json().catch(() => ({}))
  const reason = String(b?.reason ?? '')
  if (!REASONS.includes(reason as (typeof REASONS)[number])) {
    return NextResponse.json({ error: 'unknown reason' }, { status: 400 })
  }
  const post = await prisma.post.findUnique({ where: { id }, select: { id: true } })
  if (!post) return NextResponse.json({ error: 'not found' }, { status: 404 })

  await prisma.report.create({
    data: { userId: user.id, postId: id, reason, detail: String(b?.detail ?? '').slice(0, 1000) || null },
  })
  return NextResponse.json({ reported: true })
}
