'use client'
import type { Editor } from '@tiptap/react'
import { useEffect, useState } from 'react'
import { IconCode, IconDivider, IconEmbed, IconImage, IconPlus, IconUnsplash, IconVideo } from '../icons'

/**
 * The circular "+" that tracks the caret on an empty paragraph and fans out
 * into the insert options.
 */
export function EditorPlusMenu({ editor }: { editor: Editor }) {
  const [pos, setPos] = useState<{ top: number } | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const update = () => {
      const { state, view } = editor
      const { $from, empty } = state.selection
      const isEmptyPara = empty && $from.parent.type.name === 'paragraph' && $from.parent.content.size === 0
      if (!isEmptyPara) { setPos(null); setOpen(false); return }
      const coords = view.coordsAtPos($from.pos)
      const host = view.dom.getBoundingClientRect()
      setPos({ top: coords.top - host.top })
    }
    editor.on('selectionUpdate', update)
    editor.on('transaction', update)
    update()
    return () => { editor.off('selectionUpdate', update); editor.off('transaction', update) }
  }, [editor])

  if (!pos) return null

  const items = [
    { label: 'Add an image', Icon: IconImage, run: () => { const url = prompt('Image URL'); if (url) editor.chain().focus().setImage({ src: url }).run() } },
    { label: 'Add an image from a library', Icon: IconUnsplash, run: () => { const url = prompt('Paste an image URL from your library'); if (url) editor.chain().focus().setImage({ src: url }).run() } },
    { label: 'Add a video', Icon: IconVideo, run: () => { const url = prompt('Video URL (YouTube or Vimeo)'); if (url) editor.chain().focus().insertContent(`<p><a href="${url}">${url}</a></p>`).run() } },
    { label: 'Add an embed', Icon: IconEmbed, run: () => { const url = prompt('URL to embed'); if (url) editor.chain().focus().insertContent(`<p><a href="${url}">${url}</a></p>`).run() } },
    { label: 'Add a new code block', Icon: IconCode, run: () => editor.chain().focus().toggleCodeBlock().run() },
    { label: 'Add a new part', Icon: IconDivider, run: () => editor.chain().focus().setHorizontalRule().run() },
  ]

  return (
    <div className="absolute -left-12 z-20" style={{ top: pos.top - 4 }}>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Add an image, video, embed, or new part"
          aria-expanded={open}
          className={`flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-fg-secondary)] text-[var(--color-fg-secondary)] transition-transform hover:text-[var(--color-fg)] ${open ? 'rotate-45' : ''}`}
        >
          <IconPlus size={18} />
        </button>
        {open && (
          <div className="flex items-center gap-1 rounded-full border border-[var(--color-border-mid)] bg-[var(--color-bg)] px-2 py-1 shadow-[0_1px_6px_rgba(0,0,0,.12)]">
            {items.map(({ label, Icon, run }) => (
              <button
                key={label}
                title={label}
                aria-label={label}
                onClick={() => { run(); setOpen(false) }}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-fg-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-fg)]"
              >
                <Icon size={18} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
