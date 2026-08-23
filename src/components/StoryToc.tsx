'use client'
import { useEffect, useState } from 'react'
import { IconList } from './icons'

type Item = { id: string; text: string; level: number }

/** Builds itself from the headings already in the rendered story. */
export function StoryToc() {
  const [items, setItems] = useState<Item[]>([])
  const [open, setOpen] = useState(false)
  const [left, setLeft] = useState<number | null>(null)

  useEffect(() => {
    const body = document.querySelector('.story-body')
    if (!body) return
    const heads = Array.from(body.querySelectorAll('h1, h2, h3'))
    const built = heads.map((h, i) => {
      if (!h.id) h.id = `section-${i}`
      return { id: h.id, text: h.textContent ?? '', level: Number(h.tagName[1]) }
    })
    setItems(built)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  // Sit just left of the reading column rather than the viewport, so the
  // button never lands on top of the nav rail at narrower widths.
  useEffect(() => {
    const place = () => {
      const body = document.querySelector('.story-body')
      if (!body) return
      const x = body.getBoundingClientRect().left
      setLeft(x >= 300 ? x - 64 : null)
    }
    place()
    window.addEventListener('resize', place)
    return () => window.removeEventListener('resize', place)
  }, [items])

  if (items.length < 2 || left === null) return null

  return (
    <div className="fixed top-1/2 z-30 -translate-y-1/2" style={{ left }}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Table of contents"
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border-mid)] bg-[var(--color-bg)] text-[var(--color-fg-secondary)] transition-colors hover:text-[var(--color-fg)]"
      >
        <IconList size={20} />
      </button>

      {open && (
        <nav
          aria-label="Table of contents"
          className="absolute left-12 top-0 w-[260px] rounded-[4px] border border-[var(--color-border-mid)] bg-[var(--color-bg)] p-4 shadow-[0_2px_10px_rgba(0,0,0,.12)]"
        >
          <p className="mb-3 text-[12px] uppercase tracking-wide text-[var(--color-fg-secondary)]">Contents</p>
          <ul className="space-y-2">
            {items.map((it) => (
              <li key={it.id} style={{ paddingLeft: (it.level - 1) * 10 }}>
                <a
                  href={`#${it.id}`}
                  onClick={() => setOpen(false)}
                  className="block text-[13px] leading-[18px] text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)]"
                >
                  {it.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  )
}
