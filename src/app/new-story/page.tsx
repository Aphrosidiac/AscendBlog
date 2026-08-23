import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { slugify } from '@/lib/utils'

/** Creating a draft is the route itself — mirrors "click Write, start typing". */
export default async function NewStoryPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/signin')

  const existingEmpty = await prisma.post.findFirst({
    where: { authorId: user.id, status: 'DRAFT', title: '', contentHtml: { in: ['', '<p></p>'] } },
    select: { id: true },
  })
  if (existingEmpty) redirect(`/p/${existingEmpty.id}/edit`)

  const post = await prisma.post.create({
    data: { authorId: user.id, slug: `draft-${Date.now()}`, title: '', contentHtml: '<p></p>' },
    select: { id: true },
  })
  await prisma.post.update({ where: { id: post.id }, data: { slug: slugify('untitled', post.id) } })
  redirect(`/p/${post.id}/edit`)
}
