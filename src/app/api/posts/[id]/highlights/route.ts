import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await params
  const b = await req.json().catch(() => ({}))

  const text = String(b?.text ?? '').slice(0, 2000)
  const paraIndex = Number(b?.paraIndex)
  const startOff = Number(b?.startOff)
  const endOff = Number(b?.endOff)
  if (!text || !Number.isInteger(paraIndex) || paraIndex < 0 || !Number.isInteger(startOff) || !Number.isInteger(endOff) || endOff <= startOff) {
    return NextResponse.json({ error: 'bad range' }, { status: 400 })
  }

  const h = await prisma.highlight.create({
    data: { userId: user.id, postId: id, text, paraIndex, startOff, endOff },
    select: { id: true, paraIndex: true, startOff: true, endOff: true },
  })
  return NextResponse.json(h, { status: 201 })
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await params
  const highlightId = new URL(req.url).searchParams.get('highlightId')
  if (!highlightId) return NextResponse.json({ error: 'missing id' }, { status: 400 })
  await prisma.highlight.deleteMany({ where: { id: highlightId, userId: user.id, postId: id } })
  return NextResponse.json({ ok: true })
}
