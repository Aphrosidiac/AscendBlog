'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { IconClap, IconClapFill } from './icons'
import { compactNumber } from '@/lib/utils'

const MAX = 50

/**
 * Click to clap, press-and-hold to keep clapping (capped at 50 per reader).
 * Count updates optimistically; the total is flushed to the server on release.
 */
export function ClapButton({
  postId, responseId, initial, mine = 0, compact = false, size = 24,
}: {
  postId?: string
  responseId?: string
  initial: number
  mine?: number
  compact?: boolean
  size?: number
}) {
  const [total, setTotal] = useState(initial)
  const [own, setOwn] = useState(mine)
  const [burst, setBurst] = useState(false)
  const hold = useRef<ReturnType<typeof setInterval> | null>(null)
  const flush = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pending = useRef(mine)

  const sync = useCallback(() => {
    const count = pending.current
    const url = postId ? `/api/posts/${postId}/clap` : `/api/responses/${responseId}/clap`
    fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ count }),
    }).catch(() => {})
  }, [postId, responseId])

  const addOne = useCallback(() => {
    setOwn((o) => {
      if (o >= MAX) return o
      pending.current = o + 1
      setTotal((t) => t + 1)
      setBurst(true)
      if (flush.current) clearTimeout(flush.current)
      flush.current = setTimeout(sync, 600)
      return o + 1
    })
  }, [sync])

  useEffect(() => {
    if (!burst) return
    const t = setTimeout(() => setBurst(false), 220)
    return () => clearTimeout(t)
  }, [burst])

  useEffect(() => () => {
    if (hold.current) clearInterval(hold.current)
    if (flush.current) { clearTimeout(flush.current); sync() }
  }, [sync])

  const start = () => {
    addOne()
    hold.current = setInterval(addOne, 130)
  }
  const stop = () => { if (hold.current) { clearInterval(hold.current); hold.current = null } }

  const Icon = own > 0 ? IconClapFill : IconClap
  return (
    <button
      onPointerDown={start}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
      onContextMenu={(e) => e.preventDefault()}
      aria-label={own > 0 ? `Clap (${own} of ${MAX} given)` : 'Clap'}
      title={own >= MAX ? 'You gave the maximum 50 claps' : 'Clap — hold for more'}
      className={`group flex select-none items-center gap-1.5 transition-colors ${
        own > 0 ? 'text-[var(--color-fg)]' : 'text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)]'
      }`}
    >
      <span className={`inline-flex transition-transform duration-200 ${burst ? 'scale-125' : 'scale-100'}`}>
        <Icon size={compact ? 18 : size} />
      </span>
      <span className={compact ? 'text-[13px]' : 'text-[14px]'}>{compactNumber(total)}</span>
    </button>
  )
}
