import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { countWords, excerptFrom } from '@/lib/utils'

/** Autosave. Only the author can write, and only their own draft fields. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await params

  const post = await prisma.post.findUnique({ where: { id }, select: { authorId: true } })
  if (!post) return NextResponse.json({ error: 'not found' }, { status: 404 })
  if (post.authorId !== user.id) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  const b = await req.json().catch(() => ({}))
  const contentHtml = typeof b?.contentHtml === 'string' ? b.contentHtml : undefined
  const words = contentHtml ? countWords(contentHtml) : undefined

  const updated = await prisma.post.update({
    where: { id },
    data: {
      title: typeof b?.title === 'string' ? b.title.slice(0, 300) : undefined,
      subtitle: typeof b?.subtitle === 'string' ? b.subtitle.slice(0, 400) || null : undefined,
      contentHtml,
      ...(contentHtml !== undefined
        ? {
            excerpt: excerptFrom(contentHtml),
            wordCount: words,
            readingTime: Math.max(1, Math.round((words ?? 0) / 265)),
          }
        : {}),
    },
    select: { id: true, updatedAt: true },
  })
  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await params
  const post = await prisma.post.findUnique({ where: { id }, select: { authorId: true } })
  if (!post) return NextResponse.json({ error: 'not found' }, { status: 404 })
  if (post.authorId !== user.id) return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  await prisma.post.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
