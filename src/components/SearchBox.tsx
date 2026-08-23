'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { IconSearch } from './icons'

export function SearchBox() {
  const router = useRouter()
  const params = useSearchParams()
  const [q, setQ] = useState(params.get('q') ?? '')
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`) }}
      className="hidden items-center gap-2 rounded-full bg-[var(--color-bg-tertiary)] pl-3 pr-4 md:flex"
      style={{ height: 40, width: 240 }}
      role="search"
    >
      <IconSearch size={20} className="shrink-0 text-[var(--color-fg-secondary)]" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search"
        aria-label="Search Ascend"
        className="w-full bg-transparent text-[14px] text-[var(--color-fg)] outline-none placeholder:text-[var(--color-fg-secondary)]"
      />
    </form>
  )
}
