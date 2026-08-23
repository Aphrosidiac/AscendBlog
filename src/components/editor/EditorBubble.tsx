'use client'
import { BubbleMenu } from '@tiptap/react/menus'
import { useEditorState, type Editor } from '@tiptap/react'
import { useState } from 'react'
import {
  IconBold, IconItalic, IconLink, IconNote, IconPullQuote,
  IconQuote, IconTitleLarge, IconTitleSmall,
} from '../icons'

/** Declared out here so it keeps its identity between renders — a component
 *  defined inside the body is a new type each time, which remounts the subtree
 *  and drops focus out of the link field. */
function Btn({
  on, onClick, label, children,
}: { on?: boolean; onClick: () => void; label: string; children: React.ReactNode }) {
  return (
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
}

/** Selection toolbar: bold, italic, link, H1, H2, quote, pull-quote, private note. */
export function EditorBubble({ editor }: { editor: Editor }) {
  const [linking, setLinking] = useState(false)
  const [href, setHref] = useState('')

  // Re-render only when one of these flags actually flips.
  //
  // Forcing a render on every `transaction` instead looks equivalent and is
  // not: rendering the bubble repositions it, that dispatches a transaction,
  // and the two feed each other until React gives up with "Maximum update
  // depth exceeded". useEditorState compares the selected values first.
  const active = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive('bold'),
      italic: e.isActive('italic'),
      link: e.isActive('link'),
      h1: e.isActive('heading', { level: 1 }),
      h2: e.isActive('heading', { level: 2 }),
      blockquote: e.isActive('blockquote'),
      bulletList: e.isActive('bulletList'),
    }),
  })

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
          <Btn label="Bold" on={active.bold} onClick={() => editor.chain().focus().toggleBold().run()}>
            <IconBold size={18} />
          </Btn>
          <Btn label="Italic" on={active.italic} onClick={() => editor.chain().focus().toggleItalic().run()}>
            <IconItalic size={18} />
          </Btn>
          <Btn label="Link" on={active.link} onClick={() => { setHref(editor.getAttributes('link').href ?? ''); setLinking(true) }}>
            <IconLink size={18} />
          </Btn>
          <span className="mx-1 h-5 w-px bg-white/25" />
          <Btn label="Big heading" on={active.h1} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
            <IconTitleLarge size={18} />
          </Btn>
          <Btn label="Small heading" on={active.h2} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
            <IconTitleSmall size={18} />
          </Btn>
          <Btn label="Quote" on={active.blockquote} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
            <IconQuote size={18} />
          </Btn>
          <Btn label="Bulleted list" on={active.bulletList} onClick={() => editor.chain().focus().toggleBulletList().run()}>
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
