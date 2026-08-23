'use client'
import { useState } from 'react'

const REASONS: [string, string][] = [
  ['spam', 'Spam or scam'],
  ['harassment', 'Harassment or hate'],
  ['misinformation', 'Misinformation'],
  ['plagiarism', 'Plagiarised work'],
  ['other', 'Something else'],
]

export function ReportDialog({ postId, onClose }: { postId: string; onClose: () => void }) {
  const [reason, setReason] = useState('spam')
  const [detail, setDetail] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle')

  async function submit() {
    setState('sending')
    const res = await fetch(`/api/posts/${postId}/report`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ reason, detail }),
    })
    setState(res.ok ? 'sent' : 'idle')
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-6" role="dialog" aria-modal="true" aria-label="Report story">
      <div className="w-full max-w-[420px] rounded-[4px] bg-[var(--color-bg)] p-6">
        {state === 'sent' ? (
          <>
            <h2 className="text-[20px] font-medium text-[var(--color-fg)]">Thanks for telling us</h2>
            <p className="mt-3 text-[14px] leading-[22px] text-[var(--color-fg-secondary)]">
              We&rsquo;ll take a look at this story. Reports are anonymous to the author.
            </p>
            <button onClick={onClose} className="mt-6 rounded-full bg-[var(--color-bg-brand)] px-4 py-2 text-[14px] text-[var(--color-fg-inverse)]">Done</button>
          </>
        ) : (
          <>
            <h2 className="text-[20px] font-medium text-[var(--color-fg)]">Report this story</h2>
            <fieldset className="mt-4">
              <legend className="sr-only">Reason</legend>
              {REASONS.map(([value, label]) => (
                <label key={value} className="flex cursor-pointer items-center gap-3 py-2 text-[14px] text-[var(--color-fg)]">
                  <input type="radio" name="reason" value={value} checked={reason === value} onChange={() => setReason(value)} />
                  {label}
                </label>
              ))}
            </fieldset>
            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              rows={3}
              placeholder="Anything else we should know? (optional)"
              aria-label="Additional detail"
              className="mt-3 w-full resize-none border-b border-[var(--color-border-mid)] bg-transparent py-2 text-[14px] text-[var(--color-fg)] outline-none focus:border-[var(--color-fg)]"
            />
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={onClose} className="text-[14px] text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)]">Cancel</button>
              <button
                onClick={submit}
                disabled={state === 'sending'}
                className="rounded-full bg-[var(--color-bg-error)] px-4 py-2 text-[14px] text-white disabled:opacity-50"
              >
                {state === 'sending' ? 'Sending…' : 'Report'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
