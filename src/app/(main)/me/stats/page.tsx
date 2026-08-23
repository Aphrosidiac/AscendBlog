import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { PageHeader } from '@/components/PageHeader'
import { MainColumn } from '@/components/PageColumns'
import { compactNumber, formatDate } from '@/lib/utils'

export const metadata: Metadata = { title: 'Stats' }

export default async function StatsPage() {
  const me = await getCurrentUser()
  if (!me) redirect('/signin')

  const posts = await prisma.post.findMany({
    where: { authorId: me.id, status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' },
    include: {
      claps: { select: { count: true } },
      _count: { select: { responses: true, history: true } },
    },
  })

  const totals = posts.reduce(
    (acc, p) => ({
      views: acc.views + p._count.history,
      claps: acc.claps + p.claps.reduce((n, c) => n + c.count, 0),
      responses: acc.responses + p._count.responses,
    }),
    { views: 0, claps: 0, responses: 0 },
  )

  const peak = Math.max(1, ...posts.map((p) => p._count.history))

  return (
    <MainColumn width={680}>
      <PageHeader title="Stats" />

      <dl className="mt-10 grid grid-cols-3 gap-6 border-b border-[var(--color-border)] pb-8">
        {[
          ['Views', totals.views],
          ['Claps', totals.claps],
          ['Responses', totals.responses],
        ].map(([label, n]) => (
          <div key={label as string}>
            <dt className="text-[13px] text-[var(--color-fg-secondary)]">{label}</dt>
            <dd className="mt-1 text-[32px] font-bold leading-none text-[var(--color-fg)]">{compactNumber(n as number)}</dd>
          </div>
        ))}
      </dl>

      {posts.length === 0 ? (
        <p className="py-12 text-[14px] text-[var(--color-fg-secondary)]">
          Publish a story and its numbers will show up here.
        </p>
      ) : (
        <ul className="divide-y divide-[var(--color-border)]">
          {posts.map((p) => {
            const views = p._count.history
            const claps = p.claps.reduce((n, c) => n + c.count, 0)
            return (
              <li key={p.id} className="py-6">
                <Link href={`/@${me.username}/${p.slug}`} className="block">
                  <h2 className="clamp-1 text-[16px] font-bold text-[var(--color-fg)] hover:underline">{p.title}</h2>
                </Link>
                <p className="mt-1 text-[13px] text-[var(--color-fg-secondary)]">
                  {p.publishedAt ? formatDate(p.publishedAt) : 'Unpublished'} · {p.readingTime} min read
                </p>
                <div className="mt-3 flex items-center gap-6 text-[13px] text-[var(--color-fg-secondary)]">
                  <span>{compactNumber(views)} views</span>
                  <span>{compactNumber(claps)} claps</span>
                  <span>{compactNumber(p._count.responses)} responses</span>
                </div>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-bg-secondary)]" role="img" aria-label={`${views} views`}>
                  <div className="h-full rounded-full bg-[var(--color-fg)]" style={{ width: `${Math.round((views / peak) * 100)}%` }} />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </MainColumn>
  )
}
