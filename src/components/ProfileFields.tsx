'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function ProfileFields({
  initial,
}: { initial: { name: string; bio: string; about: string; pronouns: string } }) {
  const [v, setV] = useState(initial)
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const router = useRouter()

  const dirty = JSON.stringify(v) !== JSON.stringify(initial)

  async function save() {
    setState('saving')
    const res = await fetch('/api/me', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(v),
    })
    if (res.ok) { setState('saved'); router.refresh() } else setState('error')
  }

  const field = 'w-full border-b border-[var(--color-border-mid)] bg-transparent py-2 text-[14px] text-[var(--color-fg)] outline-none focus:border-[var(--color-fg)]'

  return (
    <div className="mt-6 space-y-5">
      <div>
        <label htmlFor="pf-name" className="text-[13px] text-[var(--color-fg-secondary)]">Name</label>
        <input id="pf-name" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} className={field} />
      </div>
      <div>
        <label htmlFor="pf-pronouns" className="text-[13px] text-[var(--color-fg-secondary)]">Pronouns</label>
        <input id="pf-pronouns" value={v.pronouns} onChange={(e) => setV({ ...v, pronouns: e.target.value })} placeholder="e.g. they/them" className={field} />
      </div>
      <div>
        <label htmlFor="pf-bio" className="text-[13px] text-[var(--color-fg-secondary)]">Short bio ({v.bio.length}/160)</label>
        <input id="pf-bio" maxLength={160} value={v.bio} onChange={(e) => setV({ ...v, bio: e.target.value })} className={field} />
      </div>
      <div>
        <label htmlFor="pf-about" className="text-[13px] text-[var(--color-fg-secondary)]">About</label>
        <textarea id="pf-about" rows={4} value={v.about} onChange={(e) => setV({ ...v, about: e.target.value })} className={`${field} resize-none`} />
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={save}
          disabled={!dirty || state === 'saving'}
          className="rounded-full bg-[var(--color-bg-brand)] px-4 py-2 text-[14px] text-[var(--color-fg-inverse)] disabled:opacity-40"
        >
          {state === 'saving' ? 'Saving…' : 'Save profile'}
        </button>
        {state === 'saved' && <span className="text-[13px] text-[var(--color-fg-secondary)]">Saved</span>}
        {state === 'error' && <span role="alert" className="text-[13px] text-[var(--color-fg-error)]">Could not save.</span>}
      </div>
    </div>
  )
}
