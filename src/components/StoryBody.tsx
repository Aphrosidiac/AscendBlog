'use client'
import { useCallback, useEffect, useRef, useState } from 'react'

type H = { id: string; paraIndex: number; startOff: number; endOff: number }

/**
 * The reading surface. Selecting text raises the highlight popover, the way
 * it works on the original — highlight, respond, or share the selection.
 */
export function StoryBody({
  html, postId, signedIn, highlights,
}: { html: string; postId: string; signedIn: boolean; highlights: H[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const [pop, setPop] = useState<{ x: number; y: number; text: string; para: number; start: number; end: number } | null>(null)
  const [marks, setMarks] = useState<H[]>(highlights)

  const paragraphs = useCallback(
    () => (ref.current ? Array.from(ref.current.querySelectorAll('p, li, blockquote')) : []),
    [],
  )

  // Paint stored highlights. Runs after render so it survives navigation.
  useEffect(() => {
    const paras = paragraphs()
    paras.forEach((p) => { p.innerHTML = p.innerHTML.replace(/<\/?mark[^>]*>/g, '') })
    const byPara = new Map<number, H[]>()
    for (const h of marks) {
      if (!byPara.has(h.paraIndex)) byPara.set(h.paraIndex, [])
      byPara.get(h.paraIndex)!.push(h)
    }
    for (const [idx, list] of byPara) {
      const p = paras[idx]
      if (!p) continue
      const text = p.textContent ?? ''
      const ordered = [...list].sort((a, b) => b.startOff - a.startOff)
      let out = text
      for (const h of ordered) {
        if (h.startOff < 0 || h.endOff > out.length) continue
        out = `${out.slice(0, h.startOff)}<mark class="hl">${out.slice(h.startOff, h.endOff)}</mark>${out.slice(h.endOff)}`
      }
      p.innerHTML = out
    }
  }, [marks, paragraphs])

  useEffect(() => {
    function onUp() {
      const sel = window.getSelection()
      if (!sel || sel.isCollapsed || !ref.current) { setPop(null); return }
      const text = sel.toString().trim()
      if (text.length < 2) { setPop(null); return }
      const range = sel.getRangeAt(0)
      if (!ref.current.contains(range.commonAncestorContainer)) { setPop(null); return }

      const paras = paragraphs()
      const host = paras.find((p) => p.contains(range.commonAncestorContainer)) ?? null
      const para = host ? paras.indexOf(host) : -1

      let start = 0
      if (host) {
        const pre = range.cloneRange()
        pre.selectNodeContents(host)
        pre.setEnd(range.startContainer, range.startOffset)
        start = pre.toString().length
      }

      const rect = range.getBoundingClientRect()
      setPop({
        x: rect.left + rect.width / 2,
        y: rect.top + window.scrollY - 8,
        text, para, start, end: start + text.length,
      })
    }
    document.addEventListener('mouseup', onUp)
    document.addEventListener('selectionchange', () => {
      const s = window.getSelection()
      if (!s || s.isCollapsed) setPop(null)
    })
    return () => document.removeEventListener('mouseup', onUp)
  }, [paragraphs])

  async function saveHighlight() {
    if (!pop || pop.para < 0) return
    const res = await fetch(`/api/posts/${postId}/highlights`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text: pop.text, paraIndex: pop.para, startOff: pop.start, endOff: pop.end }),
    })
    if (res.ok) {
      const h = await res.json()
      setMarks((m) => [...m, h])
    }
    window.getSelection()?.removeAllRanges()
    setPop(null)
  }

  return (
    <>
      <div ref={ref} className="story-body mt-10" dangerouslySetInnerHTML={{ __html: html }} />

      {pop && (
        <div
          className="absolute z-50 flex -translate-x-1/2 -translate-y-full items-center gap-1 rounded-[4px] bg-[var(--color-bg-inverse)] px-1 py-1 shadow-[0_2px_8px_rgba(0,0,0,.25)]"
          style={{ left: pop.x, top: pop.y }}
          role="toolbar"
          aria-label="Selection actions"
        >
          {signedIn && (
            <button onClick={saveHighlight} title="Highlight" aria-label="Highlight" className="rounded px-2 py-1.5 text-[var(--color-fg-inverse)] hover:bg-white/15">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden><path d="m4 20 3-1 10-10-2-2L5 17l-1 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><path d="m15 5 4 4" stroke="currentColor" strokeWidth="1.6"/></svg>
            </button>
          )}
          <a href="#respond" title="Respond" aria-label="Respond to selection" className="rounded px-2 py-1.5 text-[var(--color-fg-inverse)] hover:bg-white/15">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M4.5 5.5h15a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-8L8 20v-3.5H4.5a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>
          </a>
          <a
            href={`https://x.com/intent/tweet?text=${encodeURIComponent(`"${pop.text.slice(0, 180)}"`)}`}
            target="_blank" rel="noreferrer" title="Share selection" aria-label="Share selection"
            className="rounded px-2 py-1.5 text-[var(--color-fg-inverse)] hover:bg-white/15"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M12 15V4m0 0L8.5 7.5M12 4l3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 12.5v6a1.5 1.5 0 0 0 1.5 1.5h9a1.5 1.5 0 0 0 1.5-1.5v-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
          </a>
        </div>
      )}
    </>
  )
}
