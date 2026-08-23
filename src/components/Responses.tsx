import Link from 'next/link'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { Avatar } from './Avatar'
import { ResponseComposer } from './ResponseComposer'
import { ResponseItem } from './ResponseItem'

export type ResponseNode = {
  id: string
  contentHtml: string
  createdAt: Date
  author: { id: string; name: string; username: string; avatarUrl: string | null }
  clapCount: number
  myClaps: number
  children: ResponseNode[]
}

export async function Responses({ postId, signedIn }: { postId: string; signedIn: boolean }) {
  const me = await getCurrentUser()
  const rows = await prisma.response.findMany({
    where: { postId },
    orderBy: { createdAt: 'asc' },
    include: {
      author: { select: { id: true, name: true, username: true, avatarUrl: true } },
      claps: { select: { count: true, userId: true } },
    },
  })

  const byId = new Map<string, ResponseNode>()
  for (const r of rows) {
    byId.set(r.id, {
      id: r.id,
      contentHtml: r.contentHtml,
      createdAt: r.createdAt,
      author: r.author,
      clapCount: r.claps.reduce((n, c) => n + c.count, 0),
      myClaps: me ? (r.claps.find((c) => c.userId === me.id)?.count ?? 0) : 0,
      children: [],
    })
  }
  const roots: ResponseNode[] = []
  for (const r of rows) {
    const node = byId.get(r.id)!
    if (r.parentId && byId.has(r.parentId)) byId.get(r.parentId)!.children.push(node)
    else roots.push(node)
  }

  return (
    <section id="responses" className="border-t border-[var(--color-border)] py-10">
      <h2 className="mb-6 text-[20px] font-medium text-[var(--color-fg)]">
        Responses ({rows.length})
      </h2>

      <div id="respond" className="scroll-mt-24">
        {signedIn && me ? (
          <div className="mb-8 flex items-start gap-3">
            <Avatar user={me} size={32} />
            <ResponseComposer postId={postId} />
          </div>
        ) : (
          <p className="mb-8 text-[14px] text-[var(--color-fg-secondary)]">
            <Link href="/signin" className="underline hover:text-[var(--color-fg)]">Sign in</Link> to leave a response.
          </p>
        )}
      </div>

      {roots.length === 0 ? (
        <p className="text-[14px] text-[var(--color-fg-secondary)]">
          There are no responses yet. Be the first.
        </p>
      ) : (
        <ul className="space-y-8">
          {roots.map((r) => (
            <li key={r.id}>
              <ResponseItem node={r} postId={postId} signedIn={signedIn} meId={me?.id} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
