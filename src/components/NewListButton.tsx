'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function NewListButton() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [isPrivate, setPrivate] = useState(false)
  const [busy, setBusy] = useState(false)
  const router = useRouter()

  async function create() {
    if (!name.trim() || busy) return
    setBusy(true)
    const res = await fetch('/api/lists', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), isPrivate }),
    })
    setBusy(false)
    if (res.ok) { setOpen(false); setName(''); router.refresh() }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="shrink-0 rounded-full bg-[var(--color-bg-brand)] px-4 py-2 text-[14px] text-[var(--color-fg-inverse)] transition-colors hover:bg-[var(--color-bg-brand-hover)]"
      >
        New list
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6" role="dialog" aria-modal="true" aria-label="Create a list">
          <div className="w-full max-w-[400px] rounded-[4px] bg-[var(--color-bg)] p-6">
            <h2 className="text-[20px] font-medium text-[var(--color-fg)]">Create a list</h2>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') create(); if (e.key === 'Escape') setOpen(false) }}
              placeholder="Give it a name"
              aria-label="List name"
              className="mt-5 w-full border-b border-[var(--color-border-mid)] bg-transparent py-2 text-[15px] text-[var(--color-fg)] outline-none focus:border-[var(--color-fg)]"
            />
            <label className="mt-4 flex items-center gap-2 text-[14px] text-[var(--color-fg-secondary)]">
              <input type="checkbox" checked={isPrivate} onChange={(e) => setPrivate(e.target.checked)} />
              Make it private
            </label>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setOpen(false)} className="text-[14px] text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)]">Cancel</button>
              <button
                onClick={create}
                disabled={!name.trim() || busy}
                className="rounded-full bg-[var(--color-bg-brand)] px-4 py-2 text-[14px] text-[var(--color-fg-inverse)] disabled:opacity-40"
              >
                {busy ? 'Creating…' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
