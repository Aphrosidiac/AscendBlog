import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { featuredFeed, forYouFeed } from '@/lib/queries'
import { prisma } from '@/lib/db'
import { StoryCard, type FeedStory } from '@/components/StoryCard'
import { AsideRail } from '@/components/AsideRail'
import { MainColumn } from '@/components/PageColumns'
import { Marketing } from '@/components/Marketing'

export default async function HomePage({
  searchParams,
}: { searchParams: Promise<{ tab?: string; tag?: string }> }) {
  const user = await getCurrentUser()
  if (!user) return <Marketing />

  const { tab = 'for-you', tag } = await searchParams
  const followedTags = await prisma.tagFollow.findMany({
    where: { userId: user.id },
    select: { tag: { select: { slug: true, name: true } } },
  })

  let items: { story: FeedStory; reason?: string }[]
  if (tag) {
    const rows = await forYouFeed(user.id, 60)
    const tagged = await prisma.post.findMany({
      where: { status: 'PUBLISHED', tags: { some: { tag: { slug: tag } } } },
      select: { id: true },
    })
    const allow = new Set(tagged.map((t) => t.id))
    items = rows.filter((r) => allow.has(r.story.id))
  } else {
    items = tab === 'featured' ? await featuredFeed(user.id) : await forYouFeed(user.id)
  }

  const tabs = [
    { key: 'for-you', label: 'For you', href: '/' },
    { key: 'featured', label: 'Featured', href: '/?tab=featured' },
    ...followedTags.map((t) => ({ key: t.tag.slug, label: t.tag.name, href: `/?tag=${t.tag.slug}` })),
  ]
  const active = tag ?? tab

  return (
    <>
      <MainColumn>
        <nav
          className="sticky z-30 flex gap-6 overflow-x-auto border-b border-[var(--color-border)] bg-[var(--color-bg)] no-scrollbar"
          style={{ top: 'var(--height-header)' }}
        >
          {tabs.map((t) => (
            <Link
              key={t.key}
              href={t.href}
              className={`whitespace-nowrap border-b py-4 text-[14px] transition-colors ${
                active === t.key
                  ? 'border-[var(--color-fg)] text-[var(--color-fg)]'
                  : 'border-transparent text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)]'
              }`}
            >
              {t.label}
            </Link>
          ))}
        </nav>

        {items.length === 0 ? (
          <p className="py-16 text-center text-[14px] text-[var(--color-fg-secondary)]">Nothing here yet.</p>
        ) : (
          items.map(({ story, reason }) => <StoryCard key={story.id} story={story} reason={reason} />)
        )}
      </MainColumn>
      <AsideRail userId={user.id} />
    </>
  )
}
