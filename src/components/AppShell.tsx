import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { TopBar } from './TopBar'
import { LeftRail } from './LeftRail'
import { PromoStrip } from './PromoStrip'

/**
 * Signed-in chrome. Geometry measured from the real thing at 1920px:
 * rail 239 pinned left · then a centred 1336 block of main(968) + aside(368).
 * The 680 content column is centred inside main.
 */
export async function AppShell({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()

  if (!user) {
    return (
      <>
        <TopBar user={null} variant="marketing" />
        {children}
      </>
    )
  }

  const [unread, following] = await Promise.all([
    prisma.notification.count({ where: { userId: user.id, read: false } }),
    prisma.follow.findMany({
      where: { followerId: user.id },
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { following: { select: { id: true, name: true, username: true, avatarUrl: true } } },
    }),
  ])

  return (
    <>
      <TopBar user={user} unread={unread} />
      {!user.isMember && <PromoStrip />}
      <div className="flex">
        <LeftRail user={user} following={following.map((f) => f.following)} />
        <div className="flex min-w-0 flex-1 justify-center">
          <div className="flex w-full min-w-0" style={{ maxWidth: 'var(--width-shell)' }}>
            {children}
          </div>
        </div>
      </div>
    </>
  )
}
