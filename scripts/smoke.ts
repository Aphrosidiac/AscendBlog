import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) })
const BASE = 'http://localhost:3122'

async function main() {
  const user = await prisma.user.findUniqueOrThrow({ where: { username: 'fakhrul' } })
  const session = await prisma.session.create({
    data: { userId: user.id, expiresAt: new Date(Date.now() + 3600_000) },
  })
  const cookie = `ascend_session=${session.id}`

  const post = await prisma.post.findFirstOrThrow({ where: { status: 'PUBLISHED' }, include: { author: true } })
  const draft = await prisma.post.findFirstOrThrow({ where: { status: 'DRAFT' } })
  const tag = await prisma.tag.findFirstOrThrow()
  const list = await prisma.readingList.findFirstOrThrow({ where: { userId: user.id } })

  const routes = [
    '/', '/?tab=featured', `/?tag=${tag.slug}`,
    '/signin', '/signup',
    `/@${post.author.username}`, `/@${post.author.username}?tab=lists`, `/@${post.author.username}?tab=about`,
    `/@${post.author.username}/${post.slug}`,
    '/ascend-lab',
    `/p/${draft.id}/edit`,
    '/me/lists', '/me/lists?tab=saved', '/me/lists?tab=highlights', '/me/lists?tab=history', '/me/lists?tab=responses',
    '/me/notifications', '/me/notifications?tab=responses',
    '/me/settings', '/me/settings?tab=publishing', '/me/settings?tab=privacy',
    '/me/settings?tab=notifications', '/me/settings?tab=membership', '/me/settings?tab=security',
    '/me/stats',
    '/me/stories/drafts', '/me/stories/published', '/me/stories/responses',
    `/tag/${tag.slug}`,
    '/search', '/search?q=recovery', '/search?q=recovery&tab=people',
    '/search?q=recovery&tab=publications', '/search?q=recovery&tab=topics',
    '/explore',
    `/me/lists/${list.id}`,
    '/about', '/membership',
    `/@${post.author.username}/followers`, `/@${post.author.username}/following`,
  ]

  const bad: string[] = []
  for (const r of routes) {
    try {
      const res = await fetch(BASE + r, { headers: { cookie }, redirect: 'manual' })
      const ok = res.status < 400
      if (!ok) bad.push(`${res.status}  ${r}`)
      console.log(`${ok ? '  ok' : 'FAIL'} ${String(res.status).padEnd(4)} ${r}`)
    } catch (e) {
      bad.push(`ERR  ${r}`)
      console.log(`FAIL ERR  ${r}  ${(e as Error).message}`)
    }
  }
  console.log(`\n${routes.length - bad.length}/${routes.length} routes OK`)
  if (bad.length) console.log('FAILURES:\n' + bad.join('\n'))
  await prisma.session.delete({ where: { id: session.id } }).catch(() => {})
}
main().finally(() => prisma.$disconnect())
