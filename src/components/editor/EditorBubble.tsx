'use client'
import { BubbleMenu } from '@tiptap/react/menus'
import type { Editor } from '@tiptap/react'
import { useEffect, useReducer, useState } from 'react'
import {
  IconBold, IconItalic, IconLink, IconNote, IconPullQuote,
  IconQuote, IconTitleLarge, IconTitleSmall,
} from '../icons'

/** Selection toolbar: bold, italic, link, H1, H2, quote, pull-quote, private note. */
export function EditorBubble({ editor }: { editor: Editor }) {
  const [linking, setLinking] = useState(false)
  const [href, setHref] = useState('')
  // Without this the toolbar renders once and `isActive` never updates, so the
  // active format is never highlighted.
  const [, bump] = useReducer((n: number) => n + 1, 0)

  useEffect(() => {
    editor.on('transaction', bump)
    editor.on('selectionUpdate', bump)
    return () => { editor.off('transaction', bump); editor.off('selectionUpdate', bump) }
  }, [editor])

  const Btn = ({
    on, onClick, label, children,
  }: { on?: boolean; onClick: () => void; label: string; children: React.ReactNode }) => (
    <button
      onClick={onClick}
      aria-label={label}
      aria-pressed={on}
      title={label}
      className={`rounded px-2 py-1.5 transition-colors ${on ? 'text-white' : 'text-white/60 hover:text-white'}`}
    >
      {children}
    </button>
  )

  function applyLink() {
    const url = href.trim()
    if (!url) editor.chain().focus().unsetLink().run()
    else editor.chain().focus().setLink({ href: /^https?:\/\//.test(url) ? url : `https://${url}` }).run()
    setLinking(false)
    setHref('')
  }

  return (
    <BubbleMenu
      editor={editor}
      options={{ placement: 'top' }}
      className="flex items-center gap-0.5 rounded-[4px] bg-[#242424] px-1 py-1 shadow-[0_2px_8px_rgba(0,0,0,.3)]"
    >
      {linking ? (
        <div className="flex items-center gap-2 px-2 py-1">
          <input
            autoFocus
            value={href}
            onChange={(e) => setHref(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') applyLink(); if (e.key === 'Escape') setLinking(false) }}
            placeholder="Paste or type a link…"
            className="w-[240px] bg-transparent text-[14px] text-white outline-none placeholder:text-white/40"
          />
          <button onClick={applyLink} className="text-[13px] text-white/80 hover:text-white">Apply</button>
        </div>
      ) : (
        <>
          <Btn label="Bold" on={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
            <IconBold size={18} />
          </Btn>
          <Btn label="Italic" on={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
            <IconItalic size={18} />
          </Btn>
          <Btn label="Link" on={editor.isActive('link')} onClick={() => { setHref(editor.getAttributes('link').href ?? ''); setLinking(true) }}>
            <IconLink size={18} />
          </Btn>
          <span className="mx-1 h-5 w-px bg-white/25" />
          <Btn label="Big heading" on={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
            <IconTitleLarge size={18} />
          </Btn>
          <Btn label="Small heading" on={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
            <IconTitleSmall size={18} />
          </Btn>
          <Btn label="Quote" on={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
            <IconQuote size={18} />
          </Btn>
          <Btn label="Bulleted list" on={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
            <IconPullQuote size={18} />
          </Btn>
          <span className="mx-1 h-5 w-px bg-white/25" />
          <Btn label="Private note" onClick={() => alert('Private notes are only visible to you and your editors.')}>
            <IconNote size={18} />
          </Btn>
        </>
      )}
    </BubbleMenu>
  )
}
