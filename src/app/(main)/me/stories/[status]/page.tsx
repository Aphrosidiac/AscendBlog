import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { PageHeader } from '@/components/PageHeader'
import { MainColumn } from '@/components/PageColumns'
import { DeleteStoryButton } from '@/components/DeleteStoryButton'
import { compactNumber, formatDate } from '@/lib/utils'

export const metadata: Metadata = { title: 'Your stories' }

const VALID = ['drafts', 'published', 'responses'] as const

export default async function StoriesPage({ params }: { params: Promise<{ status: string }> }) {
  const me = await getCurrentUser()
  if (!me) redirect('/signin')
  const { status } = await params
  if (!VALID.includes(status as (typeof VALID)[number])) notFound()

  const posts = status === 'responses'
    ? []
    : await prisma.post.findMany({
        where: { authorId: me.id, status: status === 'drafts' ? 'DRAFT' : 'PUBLISHED' },
        orderBy: { updatedAt: 'desc' },
        include: { claps: { select: { count: true } }, _count: { select: { responses: true } } },
      })

  const responses = status === 'responses'
    ? await prisma.response.findMany({
        where: { authorId: me.id },
        orderBy: { createdAt: 'desc' },
        include: { post: { select: { slug: true, title: true, author: { select: { username: true } } } } },
      })
    : []

  return (
    <MainColumn width={680}>
      <PageHeader
        title="Your stories"
        active={status}
        action={
          <Link href="/new-story" className="shrink-0 rounded-full bg-[var(--color-bg-brand)] px-4 py-2 text-[14px] text-[var(--color-fg-inverse)] hover:bg-[var(--color-bg-brand-hover)]">
            Write a story
          </Link>
        }
        tabs={[
          { key: 'drafts', label: 'Drafts', href: '/me/stories/drafts' },
          { key: 'published', label: 'Published', href: '/me/stories/published' },
          { key: 'responses', label: 'Responses', href: '/me/stories/responses' },
        ]}
      />

      {status !== 'responses' && (
        posts.length === 0 ? (
          <p className="py-12 text-[14px] text-[var(--color-fg-secondary)]">
            {status === 'drafts' ? 'No drafts. ' : 'Nothing published yet. '}
            <Link href="/new-story" className="underline hover:text-[var(--color-fg)]">Start writing.</Link>
          </p>
        ) : (
          <ul className="divide-y divide-[var(--color-border)]">
            {posts.map((p) => (
              <li key={p.id} className="py-6">
                <Link href={status === 'drafts' ? `/p/${p.id}/edit` : `/@${me.username}/${p.slug}`} className="block">
                  <h2 className="clamp-1 text-[20px] font-bold text-[var(--color-fg)] hover:underline">
                    {p.title || 'Untitled story'}
                  </h2>
                  {p.excerpt && <p className="clamp-1 mt-1 text-[14px] text-[var(--color-fg-secondary)]">{p.excerpt}</p>}
                </Link>
                <div className="mt-2 flex items-center gap-4 text-[13px] text-[var(--color-fg-secondary)]">
                  <span>
                    {status === 'drafts'
                      ? `Last edited ${formatDate(p.updatedAt)}`
                      : `${p.publishedAt ? formatDate(p.publishedAt) : ''} · ${compactNumber(p.claps.reduce((n, c) => n + c.count, 0))} claps · ${compactNumber(p._count.responses)} responses`}
                  </span>
                  <Link href={`/p/${p.id}/edit`} className="hover:text-[var(--color-fg)]">Edit</Link>
                  <DeleteStoryButton postId={p.id} />
                </div>
              </li>
            ))}
          </ul>
        )
      )}

      {status === 'responses' && (
        responses.length === 0 ? (
          <p className="py-12 text-[14px] text-[var(--color-fg-secondary)]">You haven&rsquo;t responded to anything yet.</p>
        ) : (
          <ul className="divide-y divide-[var(--color-border)]">
            {responses.map((r) => (
              <li key={r.id} className="py-6">
                <Link href={`/@${r.post.author.username}/${r.post.slug}#responses`} className="text-[13px] text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)]">
                  On {r.post.title}
                </Link>
                <div className="mt-2 text-[16px] leading-[24px] text-[var(--color-fg)]" dangerouslySetInnerHTML={{ __html: r.contentHtml }} />
              </li>
            ))}
          </ul>
        )
      )}
    </MainColumn>
  )
}
