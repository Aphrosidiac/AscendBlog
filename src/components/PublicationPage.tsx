import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { Avatar } from './Avatar'
import { StoryCard } from './StoryCard'
import { savedPostIds } from '@/lib/queries'

export async function PublicationPage({ slug }: { slug: string }) {
  const pub = await prisma.publication.findUnique({
    where: { slug },
    include: {
      members: { include: { user: { select: { id: true, name: true, username: true, avatarUrl: true } } } },
    },
  })
  if (!pub) notFound()

  const me = await getCurrentUser()
  const saved = await savedPostIds(me?.id)
  const posts = await prisma.post.findMany({
    where: { publicationId: pub.id, status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' },
    include: {
      author: { select: { id: true, name: true, username: true, avatarUrl: true, isVerified: true } },
      publication: { select: { slug: true, name: true } },
      claps: { select: { count: true } },
      _count: { select: { responses: true } },
    },
  })

  return (
    <>
      <main className="min-w-0 flex-1 px-6">
        <div className="mx-auto w-full pt-14" style={{ maxWidth: 680 }}>
          <header className="border-b border-[var(--color-border)] pb-10 text-center">
            <h1 className="font-[family-name:var(--font-display-serif)] text-[52px] leading-[58px] text-[var(--color-fg)]">
              {pub.name}
            </h1>
            {pub.tagline && <p className="mt-3 text-[18px] text-[var(--color-fg-secondary)]">{pub.tagline}</p>}
            {pub.description && (
              <p className="mx-auto mt-4 max-w-[520px] text-[14px] leading-[22px] text-[var(--color-fg-secondary)]">
                {pub.description}
              </p>
            )}
            <div className="mt-6 flex items-center justify-center -space-x-2">
              {pub.members.map((m) => (
                <Avatar key={m.userId} user={m.user} size={32} className="ring-2 ring-[var(--color-bg)]" />
              ))}
            </div>
          </header>

          {posts.length === 0 ? (
            <p className="py-16 text-center text-[14px] text-[var(--color-fg-secondary)]">No stories yet.</p>
          ) : (
            posts.map((p) => (
              <StoryCard
                key={p.id}
                story={{
                  id: p.id, slug: p.slug, title: p.title, subtitle: p.subtitle, excerpt: p.excerpt,
                  coverImage: p.coverImage, readingTime: p.readingTime, publishedAt: p.publishedAt,
                  isMemberOnly: p.isMemberOnly, author: p.author, publication: p.publication,
                  clapCount: p.claps.reduce((n, c) => n + c.count, 0),
                  responseCount: p._count.responses,
                  saved: saved.has(p.id),
                }}
              />
            ))
          )}
        </div>
      </main>

      <aside
        className="sticky hidden shrink-0 self-start border-l border-[var(--color-border)] px-6 pt-14 xl:block"
        style={{ width: 'var(--width-aside)', top: 'var(--height-header)' }}
      >
        <h2 className="text-[16px] font-medium leading-[20px] text-[var(--color-fg)]">Writers</h2>
        <ul className="mt-4 space-y-4">
          {pub.members.map((m) => (
            <li key={m.userId} className="flex items-center gap-3">
              <Avatar user={m.user} size={32} />
              <div className="min-w-0">
                <Link href={`/@${m.user.username}`} className="block text-[14px] text-[var(--color-fg)] hover:underline">
                  {m.user.name}
                </Link>
                <p className="text-[12px] uppercase tracking-wide text-[var(--color-fg-secondary)]">{m.role.toLowerCase()}</p>
              </div>
            </li>
          ))}
        </ul>
      </aside>
    </>
  )
}
