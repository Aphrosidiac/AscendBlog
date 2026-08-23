'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import LinkExt from '@tiptap/extension-link'
import ImageExt from '@tiptap/extension-image'
import { Wordmark } from '../Wordmark'
import { Avatar } from '../Avatar'
import { IconBell } from '../icons'
import { EditorBubble } from './EditorBubble'
import { EditorPlusMenu } from './EditorPlusMenu'
import { PublishDialog } from './PublishDialog'

type U = { id: string; name: string; username: string; avatarUrl: string | null }

export function EditorShell({
  postId, initialTitle, initialSubtitle, initialHtml, user, status, allTags, postTags, slugPath,
}: {
  postId: string
  initialTitle: string
  initialSubtitle: string
  initialHtml: string
  user: U
  status: 'DRAFT' | 'PUBLISHED' | 'UNLISTED'
  allTags: { slug: string; name: string }[]
  postTags: string[]
  slugPath: string | null
}) {
  const [title, setTitle] = useState(initialTitle)
  const [subtitle, setSubtitle] = useState(initialSubtitle)
  const [saved, setSaved] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [publishOpen, setPublishOpen] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const router = useRouter()

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Placeholder.configure({ placeholder: 'Tell your story…' }),
      LinkExt.configure({ openOnClick: false, autolink: true }),
      ImageExt.configure({ inline: false }),
    ],
    content: initialHtml || '<p></p>',
    editorProps: {
      attributes: { class: 'story-body editor-surface outline-none', 'aria-label': 'Story body' },
    },
  })

  const save = useCallback(async () => {
    if (!editor) return
    setSaved('saving')
    await fetch(`/api/posts/${postId}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title, subtitle, contentHtml: editor.getHTML() }),
    }).catch(() => {})
    setSaved('saved')
  }, [editor, postId, title, subtitle])

  const queueSave = useCallback(() => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(save, 1200)
  }, [save])

  useEffect(() => {
    if (!editor) return
    editor.on('update', queueSave)
    return () => { editor.off('update', queueSave) }
  }, [editor, queueSave])

  useEffect(() => {
    if (title !== initialTitle || subtitle !== initialSubtitle) queueSave()
  }, [title, subtitle, queueSave, initialTitle, initialSubtitle])

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <header className="flex h-[65px] items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <Wordmark size={26} />
          <span className="text-[14px] text-[var(--color-fg-secondary)]">
            {status === 'PUBLISHED' ? 'Edit story' : 'Draft'}
            {saved === 'saving' && <span className="ml-2">Saving…</span>}
            {saved === 'saved' && <span className="ml-2">Saved</span>}
          </span>
        </div>
        <div className="flex items-center gap-5">
          <button
            onClick={() => setPublishOpen(true)}
            disabled={!title.trim()}
            title={!title.trim() ? 'Add a title first' : undefined}
            className="rounded-full bg-[var(--color-bg-brand)] px-4 py-1.5 text-[13px] text-[var(--color-fg-inverse)] transition-colors hover:bg-[var(--color-bg-brand-hover)] disabled:opacity-40"
          >
            {status === 'PUBLISHED' ? 'Save changes' : 'Publish'}
          </button>
          {slugPath && status === 'PUBLISHED' && (
            <Link href={slugPath} className="text-[13px] text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)]">View</Link>
          )}
          <Link href="/me/notifications" aria-label="Notifications" className="text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)]">
            <IconBell size={22} />
          </Link>
          <Avatar user={user} size={32} />
        </div>
      </header>

      <div className="mx-auto w-full px-6 pb-40 pt-8" style={{ maxWidth: 'calc(var(--width-editor) + 3rem)' }}>
        <textarea
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); editor?.commands.focus('start') } }}
          placeholder="Title"
          rows={1}
          aria-label="Story title"
          className="w-full resize-none overflow-hidden bg-transparent font-[family-name:var(--font-display-serif)] text-[42px] leading-[52px] text-[var(--color-fg)] outline-none placeholder:text-[#b3b3b3]"
          ref={(el) => { if (el) { el.style.height = 'auto'; el.style.height = `${el.scrollHeight}px` } }}
        />
        <textarea
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder="Tell readers what this is about (optional)"
          rows={1}
          aria-label="Story subtitle"
          className="mt-2 w-full resize-none overflow-hidden bg-transparent text-[22px] leading-[30px] text-[var(--color-fg-secondary)] outline-none placeholder:text-[#b3b3b3]"
          ref={(el) => { if (el) { el.style.height = 'auto'; el.style.height = `${el.scrollHeight}px` } }}
        />

        <div className="relative mt-6">
          {editor && <EditorPlusMenu editor={editor} />}
          {editor && <EditorBubble editor={editor} />}
          <EditorContent editor={editor} />
        </div>
      </div>

      {publishOpen && editor && (
        <PublishDialog
          postId={postId}
          allTags={allTags}
          initialTags={postTags}
          alreadyPublished={status === 'PUBLISHED'}
          onClose={() => setPublishOpen(false)}
          onDone={(path) => { setPublishOpen(false); router.push(path) }}
          beforePublish={save}
        />
      )}
    </div>
  )
}
