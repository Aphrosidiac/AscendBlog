import localFont from 'next/font/local'

/**
 * Typeface substitutions for Medium's proprietary stack, chosen by measuring
 * advance width / cap-height / x-height against the originals (see
 * _research/03-fonts.md). All three are OFL-licensed and self-hosted.
 */

// sohne -> Instrument Sans  (+2.3% advance, identical cap-height)
export const sans = localFont({
  src: [
    { path: '../../node_modules/@fontsource-variable/instrument-sans/files/instrument-sans-latin-wght-normal.woff2', style: 'normal', weight: '400 700' },
    { path: '../../node_modules/@fontsource-variable/instrument-sans/files/instrument-sans-latin-wght-italic.woff2', style: 'italic', weight: '400 700' },
  ],
  variable: '--font-sans',
  display: 'swap',
  fallback: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica', 'Arial', 'sans-serif'],
})

// source-serif-pro -> Source Serif 4  (same typeface, exact match)
export const serif = localFont({
  src: [
    { path: '../../node_modules/@fontsource-variable/source-serif-4/files/source-serif-4-latin-wght-normal.woff2', style: 'normal', weight: '200 900' },
    { path: '../../node_modules/@fontsource-variable/source-serif-4/files/source-serif-4-latin-wght-italic.woff2', style: 'italic', weight: '200 900' },
  ],
  variable: '--font-serif',
  display: 'swap',
  fallback: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
})

// noe (wordmark) -> Outfit, Ascend's existing brand display face
export const display = localFont({
  src: [{ path: '../../node_modules/@fontsource-variable/outfit/files/outfit-latin-wght-normal.woff2', style: 'normal', weight: '100 900' }],
  variable: '--font-display',
  display: 'swap',
  fallback: ['Georgia', 'serif'],
})

// gt-super -> Newsreader, for the marketing display headlines
export const displaySerif = localFont({
  src: [{ path: '../../node_modules/@fontsource-variable/newsreader/files/newsreader-latin-wght-normal.woff2', style: 'normal', weight: '200 800' }],
  variable: '--font-display-serif',
  display: 'swap',
  fallback: ['Georgia', 'Times New Roman', 'serif'],
})
