import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { EditorShell } from '@/components/editor/EditorShell'

export const metadata: Metadata = { title: 'Edit story' }

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) redirect('/signin')
  const { id } = await params

  const post = await prisma.post.findUnique({
    where: { id },
    include: { tags: { select: { tag: { select: { slug: true } } } }, author: { select: { username: true } } },
  })
  if (!post) notFound()
  if (post.authorId !== user.id) notFound()

  const allTags = await prisma.tag.findMany({ select: { slug: true, name: true }, orderBy: { name: 'asc' } })

  return (
    <EditorShell
      postId={post.id}
      initialTitle={post.title}
      initialSubtitle={post.subtitle ?? ''}
      initialHtml={post.contentHtml}
      user={{ id: user.id, name: user.name, username: user.username, avatarUrl: user.avatarUrl }}
      status={post.status}
      allTags={allTags}
      postTags={post.tags.map((t) => t.tag.slug)}
      slugPath={post.status === 'PUBLISHED' ? `/@${post.author.username}/${post.slug}` : null}
    />
  )
}
