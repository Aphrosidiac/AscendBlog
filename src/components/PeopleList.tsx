import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { Avatar } from './Avatar'
import { FollowButton } from './FollowButton'
import { MainColumn } from './PageColumns'
import { IconVerified } from './icons'
import { compactNumber } from '@/lib/utils'

export async function PeopleList({ handle, mode }: { handle: string; mode: 'followers' | 'following' }) {
  if (!handle.startsWith('@')) notFound()
  const profile = await prisma.user.findUnique({
    where: { username: handle.slice(1) },
    select: { id: true, name: true, username: true },
  })
  if (!profile) notFound()

  const me = await getCurrentUser()
  const rows = mode === 'followers'
    ? await prisma.follow.findMany({
        where: { followingId: profile.id },
        include: { follower: { select: { id: true, name: true, username: true, avatarUrl: true, bio: true, isVerified: true, _count: { select: { followers: true } } } } },
      })
    : await prisma.follow.findMany({
        where: { followerId: profile.id },
        include: { following: { select: { id: true, name: true, username: true, avatarUrl: true, bio: true, isVerified: true, _count: { select: { followers: true } } } } },
      })

  const people = rows.map((r) => ('follower' in r ? r.follower : r.following))
  const myFollows = me
    ? new Set((await prisma.follow.findMany({ where: { followerId: me.id }, select: { followingId: true } })).map((f) => f.followingId))
    : new Set<string>()

  return (
    <MainColumn width={680}>
      <div className="pt-14">
        <Link href={`/${handle}`} className="text-[13px] text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)]">
          {profile.name}
        </Link>
        <h1 className="mt-2 text-[42px] font-medium leading-[52px] tracking-[-0.011em] text-[var(--color-fg)]">
          {mode === 'followers' ? 'Followers' : 'Following'}
        </h1>
        <p className="mt-2 text-[13px] text-[var(--color-fg-secondary)]">{compactNumber(people.length)} people</p>
      </div>

      {people.length === 0 ? (
        <p className="py-12 text-[14px] text-[var(--color-fg-secondary)]">
          {mode === 'followers' ? 'No followers yet.' : 'Not following anyone yet.'}
        </p>
      ) : (
        <ul className="mt-8 divide-y divide-[var(--color-border)] border-t border-[var(--color-border)]">
          {people.map((p) => (
            <li key={p.id} className="flex items-start gap-4 py-6">
              <Avatar user={p} size={48} />
              <div className="min-w-0 flex-1">
                <Link href={`/@${p.username}`} className="flex items-center gap-2 text-[16px] font-bold text-[var(--color-fg)] hover:underline">
                  {p.name}
                  {p.isVerified && <IconVerified />}
                </Link>
                {p.bio && <p className="clamp-2 mt-1 text-[14px] text-[var(--color-fg-secondary)]">{p.bio}</p>}
                <p className="mt-1 text-[13px] text-[var(--color-fg-secondary)]">{compactNumber(p._count.followers)} followers</p>
              </div>
              {me && me.id !== p.id && <FollowButton userId={p.id} initial={myFollows.has(p.id)} />}
            </li>
          ))}
        </ul>
      )}
    </MainColumn>
  )
}
