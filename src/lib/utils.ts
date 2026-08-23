export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

/** Medium shows "5 min read" — 265 wpm, images add 12s decaying to 3s. */
export function readingTime(words: number, images = 0) {
  let imgSeconds = 0
  for (let i = 0; i < images; i++) imgSeconds += Math.max(3, 12 - i)
  return Math.max(1, Math.round((words / 265) * 60 + imgSeconds) / 60 | 0) || 1
}

export function slugify(title: string, id: string) {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 72)
    .replace(/-+$/, '')
  return `${base || 'untitled'}-${id.slice(-12)}`
}

/** Medium's date rule: "5h ago"/"Aug 10" this year/"May 17, 2024" otherwise. */
export function formatDate(d: Date | string, opts: { short?: boolean } = {}) {
  const date = typeof d === 'string' ? new Date(d) : d
  const now = new Date()
  const diff = (now.getTime() - date.getTime()) / 1000
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`
  const sameYear = date.getFullYear() === now.getFullYear()
  return date.toLocaleDateString('en-US', {
    month: opts.short ? 'short' : 'short',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
  })
}

/** 1.2K / 3.4M, the way engagement counts render. */
export function compactNumber(n: number) {
  if (n < 1000) return String(n)
  if (n < 1_000_000) {
    const v = n / 1000
    return `${v < 10 ? v.toFixed(1).replace(/\.0$/, '') : Math.round(v)}K`
  }
  const v = n / 1_000_000
  return `${v < 10 ? v.toFixed(1).replace(/\.0$/, '') : Math.round(v)}M`
}

export function excerptFrom(html: string, len = 140) {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  return text.length > len ? text.slice(0, len).trimEnd() + '…' : text
}

export function countWords(html: string) {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  return text ? text.split(' ').length : 0
}

/** Deterministic avatar tint so seeded users look distinct without images. */
export function avatarColor(seed: string) {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  const hues = [12, 34, 90, 145, 190, 215, 260, 310]
  return `hsl(${hues[h % hues.length]} 42% 62%)`
}
