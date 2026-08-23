'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Avatar } from './Avatar'
import { ClapButton } from './ClapButton'
import { ResponseComposer } from './ResponseComposer'
import { formatDate } from '@/lib/utils'
import type { ResponseNode } from './Responses'

export function ResponseItem({
  node, postId, signedIn, meId, depth = 0,
}: { node: ResponseNode; postId: string; signedIn: boolean; meId?: string; depth?: number }) {
  const [replying, setReplying] = useState(false)
  const router = useRouter()

  async function remove() {
    if (!confirm('Delete this response?')) return
    const res = await fetch(`/api/responses/${node.id}`, { method: 'DELETE' })
    if (res.ok) router.refresh()
  }

  return (
    <div>
      <div className="flex items-start gap-3">
        <Avatar user={node.author} size={32} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[14px]">
            <Link href={`/@${node.author.username}`} className="font-medium text-[var(--color-fg)] hover:underline">
              {node.author.name}
            </Link>
            <span className="text-[13px] text-[var(--color-fg-secondary)]">{formatDate(node.createdAt)}</span>
          </div>
          <div
            className="mt-2 text-[16px] leading-[24px] text-[var(--color-fg)] [&_p]:mt-2 [&_p:first-child]:mt-0"
            dangerouslySetInnerHTML={{ __html: node.contentHtml }}
          />
          <div className="mt-3 flex items-center gap-5 text-[13px] text-[var(--color-fg-secondary)]">
            <ClapButton responseId={node.id} initial={node.clapCount} mine={node.myClaps} compact />
            {signedIn && depth < 3 && (
              <button onClick={() => setReplying((v) => !v)} className="hover:text-[var(--color-fg)]">Reply</button>
            )}
            {meId === node.author.id && (
              <button onClick={remove} className="hover:text-[var(--color-fg-error)]">Delete</button>
            )}
          </div>

          {replying && (
            <div className="mt-4">
              <ResponseComposer postId={postId} parentId={node.id} autoFocus onDone={() => setReplying(false)} />
            </div>
          )}
        </div>
      </div>

      {node.children.length > 0 && (
        <ul className="mt-6 space-y-6 border-l border-[var(--color-border)] pl-6">
          {node.children.map((c) => (
            <li key={c.id}>
              <ResponseItem node={c} postId={postId} signedIn={signedIn} meId={meId} depth={depth + 1} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
