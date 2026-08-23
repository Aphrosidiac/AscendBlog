import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { Avatar } from '@/components/Avatar'
import { AsideRail } from '@/components/AsideRail'
import { PageHeader } from '@/components/PageHeader'
import { MainColumn } from '@/components/PageColumns'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = { title: 'Notifications' }

const COPY: Record<string, string> = {
  CLAP: 'clapped for your story',
  RESPONSE: 'responded to your story',
  FOLLOW: 'started following you',
  MENTION: 'mentioned you',
  HIGHLIGHT: 'highlighted your story',
  PUBLISHED: 'published a new story',
}

export default async function NotificationsPage({
  searchParams,
}: { searchParams: Promise<{ tab?: string }> }) {
  const me = await getCurrentUser()
  if (!me) redirect('/signin')
  const { tab = 'all' } = await searchParams

  const items = await prisma.notification.findMany({
    where: { userId: me.id, ...(tab === 'responses' ? { type: 'RESPONSE' } : {}) },
    orderBy: { createdAt: 'desc' },
    take: 60,
    include: {
      actor: { select: { id: true, name: true, username: true, avatarUrl: true } },
      post: { select: { slug: true, title: true, author: { select: { username: true } } } },
    },
  })

  // Opening the page is what marks them read.
  await prisma.notification.updateMany({ where: { userId: me.id, read: false }, data: { read: true } })

  return (
    <>
      <MainColumn width={680}>
        <PageHeader
          title="Notifications"
          active={tab}
          tabs={[
            { key: 'all', label: 'All', href: '/me/notifications' },
            { key: 'responses', label: 'Responses', href: '/me/notifications?tab=responses' },
          ]}
        />
        {items.length === 0 ? (
          <p className="py-12 text-center text-[14px] text-[var(--color-fg-secondary)]">You&rsquo;re all caught up.</p>
        ) : (
          <ul className="divide-y divide-[var(--color-border)]">
            {items.map((n) => (
              <li key={n.id} className="flex items-start gap-3 py-5">
                <Avatar user={n.actor} size={32} />
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] leading-[20px] text-[var(--color-fg)]">
                    <Link href={`/@${n.actor.username}`} className="font-medium hover:underline">{n.actor.name}</Link>{' '}
                    <span className="text-[var(--color-fg-secondary)]">{COPY[n.type] ?? 'interacted with you'}</span>
                  </p>
                  {n.post && (
                    <Link
                      href={`/@${n.post.author.username}/${n.post.slug}`}
                      className="clamp-1 mt-1 block text-[14px] font-bold text-[var(--color-fg)] hover:underline"
                    >
                      {n.post.title}
                    </Link>
                  )}
                  <p className="mt-1 text-[13px] text-[var(--color-fg-secondary)]">{formatDate(n.createdAt)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </MainColumn>
      <AsideRail userId={me.id} />
    </>
  )
}
