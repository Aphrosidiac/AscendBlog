import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { notify } from '@/lib/notify'
import { guardWrites } from '@/lib/guard'

/** Plain text in, escaped paragraphs out — responses are never raw HTML. */
function toParagraphs(text: string) {
  const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${esc(p).replace(/\n/g, '<br />')}</p>`)
    .join('')
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const gate = await guardWrites()
  if (gate) return gate

  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await params

  const body = await req.json().catch(() => ({}))
  const text = String(body?.text ?? '').trim()
  if (!text) return NextResponse.json({ error: 'empty' }, { status: 400 })
  if (text.length > 10_000) return NextResponse.json({ error: 'too long' }, { status: 400 })

  const post = await prisma.post.findUnique({ where: { id }, select: { authorId: true, allowResponses: true } })
  if (!post) return NextResponse.json({ error: 'not found' }, { status: 404 })
  if (!post.allowResponses) return NextResponse.json({ error: 'responses are off' }, { status: 403 })

  const parentId = body?.parentId ? String(body.parentId) : undefined
  if (parentId) {
    const parent = await prisma.response.findUnique({ where: { id: parentId }, select: { postId: true } })
    if (!parent || parent.postId !== id) {
      return NextResponse.json({ error: 'bad parent' }, { status: 400 })
    }
  }

  const created = await prisma.response.create({
    data: { postId: id, authorId: user.id, parentId, contentHtml: toParagraphs(text) },
    select: { id: true },
  })

  // Notify the thread parent's author when replying, otherwise the story author.
  const target = parentId
    ? (await prisma.response.findUnique({ where: { id: parentId }, select: { authorId: true } }))?.authorId
    : post.authorId
  if (target) await notify({ userId: target, actorId: user.id, type: 'RESPONSE', postId: id, responseId: created.id })

  return NextResponse.json({ id: created.id }, { status: 201 })
}
