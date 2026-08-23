import type { SVGProps } from 'react'

type P = SVGProps<SVGSVGElement> & { size?: number }
const base = ({ size = 24, ...p }: P) => ({
  width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
  xmlns: 'http://www.w3.org/2000/svg', ...p,
})

export const IconHome = (p: P) => (
  <svg {...base(p)}><path d="M4 9.5 12 3l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1V9.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
)
export const IconHomeFill = (p: P) => (
  <svg {...base(p)}><path d="M4 9.5 12 3l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1V9.5Z" fill="currentColor"/></svg>
)
export const IconBookmark = (p: P) => (
  <svg {...base(p)}><path d="M6.5 3.5h11a1 1 0 0 1 1 1v16l-6.5-4.2-6.5 4.2v-16a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
)
export const IconBookmarkFill = (p: P) => (
  <svg {...base(p)}><path d="M6.5 3.5h11a1 1 0 0 1 1 1v16l-6.5-4.2-6.5 4.2v-16a1 1 0 0 1 1-1Z" fill="currentColor"/></svg>
)
export const IconBookmarkPlus = (p: P) => (
  <svg {...base(p)}>
    <path d="M6.5 3.5h11a1 1 0 0 1 1 1v16l-6.5-4.2-6.5 4.2v-16a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M12 7.5v5M9.5 10h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)
export const IconPerson = (p: P) => (
  <svg {...base(p)}><circle cx="12" cy="8" r="3.75" stroke="currentColor" strokeWidth="1.5"/><path d="M4.5 20.5c0-3.6 3.4-6 7.5-6s7.5 2.4 7.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
)
export const IconPersonFill = (p: P) => (
  <svg {...base(p)}><circle cx="12" cy="8" r="3.75" fill="currentColor"/><path d="M4.5 21c0-3.6 3.4-6 7.5-6s7.5 2.4 7.5 6" fill="currentColor"/></svg>
)
export const IconDoc = (p: P) => (
  <svg {...base(p)}><path d="M6 3.5h8L18.5 8v12.5a.5.5 0 0 1-.5.5H6a.5.5 0 0 1-.5-.5v-17a.5.5 0 0 1 .5-.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M13.5 3.5V8.5h5M8 12.5h8M8 16h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
)
export const IconStats = (p: P) => (
  <svg {...base(p)}><path d="M4.5 20V13M9.5 20V7M14.5 20v-9M19.5 20V4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
)
export const IconPeople = (p: P) => (
  <svg {...base(p)}><circle cx="9" cy="8.5" r="3.25" stroke="currentColor" strokeWidth="1.5"/><path d="M2.75 19.5c0-3.1 2.8-5.2 6.25-5.2s6.25 2.1 6.25 5.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M16 5.6a3.25 3.25 0 0 1 0 5.8M17.6 14.7c2.2.6 3.65 2.3 3.65 4.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
)
export const IconPlus = (p: P) => (
  <svg {...base(p)}><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
)
export const IconMinus = (p: P) => (
  <svg {...base(p)}><path d="M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
)
export const IconCheck = (p: P) => (
  <svg {...base(p)}><path d="m5 12.5 4.5 4.5L19 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
)
export const IconSearch = (p: P) => (
  <svg {...base(p)}><circle cx="10.75" cy="10.75" r="6.25" stroke="currentColor" strokeWidth="1.6"/><path d="m15.5 15.5 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
)
export const IconBell = (p: P) => (
  <svg {...base(p)}><path d="M6.5 10a5.5 5.5 0 0 1 11 0c0 4 1.5 5.5 1.5 5.5H5S6.5 14 6.5 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M10 18.5a2.2 2.2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
)
export const IconWrite = (p: P) => (
  <svg {...base(p)}><path d="M4 20h5l10-10a2.5 2.5 0 0 0-3.5-3.5L5.5 16.5 4 20Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="m14.5 8 2 2" stroke="currentColor" strokeWidth="1.5"/></svg>
)
/** Applause mark used for the clap affordance. */
export const IconClap = (p: P) => (
  <svg {...base(p)}>
    <path d="M11.4 3.6 12.6 8M8.1 4.9l1.8 3.6M15.2 5.4 13.6 8.9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    <path d="M9.2 10.6 7.6 9a1.35 1.35 0 0 0-1.9 1.9l1 1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6.7 11.9c-1 1-1.2 2.6-.5 4.2l.9 2c.9 2 2.9 3.3 5.1 3.3h.6a5.2 5.2 0 0 0 5.2-5.2v-3.6a1.3 1.3 0 0 0-2.6 0m0-.6a1.3 1.3 0 1 0-2.6 0m0 .3a1.3 1.3 0 1 0-2.6 0v.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
export const IconClapFill = (p: P) => (
  <svg {...base(p)}>
    <path d="M11.4 3.6 12.6 8M8.1 4.9l1.8 3.6M15.2 5.4 13.6 8.9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    <path d="M9.2 10.6 7.6 9a1.35 1.35 0 0 0-1.9 1.9l1 1" fill="currentColor" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
    <path d="M6.7 11.9c-1 1-1.2 2.6-.5 4.2l.9 2c.9 2 2.9 3.3 5.1 3.3h.6a5.2 5.2 0 0 0 5.2-5.2v-3.6a1.3 1.3 0 0 0-2.6 0v-.6a1.3 1.3 0 1 0-2.6 0v.3a1.3 1.3 0 1 0-2.6 0v.8" fill="currentColor" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
  </svg>
)
export const IconComment = (p: P) => (
  <svg {...base(p)}><path d="M4.5 5.5h15a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-7.2L8 21v-4.5H4.5a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
)
export const IconRepost = (p: P) => (
  <svg {...base(p)}><path d="M5 8.5h11a2.5 2.5 0 0 1 2.5 2.5v2M19 15.5H8A2.5 2.5 0 0 1 5.5 13v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="m7.5 6 -2.5 2.5 2.5 2.5M16.5 13l2.5 2.5-2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
)
export const IconPlay = (p: P) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.5"/><path d="M10.3 9.2v5.6l4.6-2.8-4.6-2.8Z" fill="currentColor"/></svg>
)
export const IconShare = (p: P) => (
  <svg {...base(p)}><path d="M12 15.5V4m0 0L8.2 7.8M12 4l3.8 3.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M5.5 12.5v6a1.5 1.5 0 0 0 1.5 1.5h10a1.5 1.5 0 0 0 1.5-1.5v-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
)
export const IconEllipsis = (p: P) => (
  <svg {...base(p)}><circle cx="5.5" cy="12" r="1.6" fill="currentColor"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/><circle cx="18.5" cy="12" r="1.6" fill="currentColor"/></svg>
)
export const IconClose = (p: P) => (
  <svg {...base(p)}><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
)
export const IconChevronRight = (p: P) => (
  <svg {...base(p)}><path d="m9.5 5 7 7-7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
)
export const IconChevronLeft = (p: P) => (
  <svg {...base(p)}><path d="m14.5 5-7 7 7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
)
export const IconChevronDown = (p: P) => (
  <svg {...base(p)}><path d="m5 9.5 7 7 7-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
)
export const IconArrowUpRight = (p: P) => (
  <svg {...base(p)}><path d="M7 17 17 7M8.5 7H17v8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
)
export const IconMenu = (p: P) => (
  <svg {...base(p)}><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
)
export const IconMute = (p: P) => (
  <svg {...base(p)}><path d="M4.5 9.5h3L11 6.2v11.6L7.5 14.5h-3v-5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="m15 10 4 4M19 10l-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
)
export const IconList = (p: P) => (
  <svg {...base(p)}><path d="M4 6.5h16M4 12h16M4 17.5h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
)
export const IconImage = (p: P) => (
  <svg {...base(p)}><rect x="3.5" y="5.5" width="17" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><circle cx="8.5" cy="10" r="1.5" fill="currentColor"/><path d="m4 16 4.5-4.5 4 4 3-2.5 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
)
export const IconVideo = (p: P) => (
  <svg {...base(p)}><rect x="3.5" y="6" width="12" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="m16 11 4.5-3v8L16 13v-2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
)
export const IconEmbed = (p: P) => (
  <svg {...base(p)}><path d="m9 8.5-4 3.5 4 3.5M15 8.5l4 3.5-4 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
)
export const IconCode = (p: P) => (
  <svg {...base(p)}><rect x="3.5" y="4.5" width="17" height="15" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="m9.5 10-2 2 2 2M14.5 10l2 2-2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
)
export const IconDivider = (p: P) => (
  <svg {...base(p)}><path d="M4 12h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="8" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="16" cy="12" r="1" fill="currentColor"/></svg>
)
export const IconUnsplash = (p: P) => (
  <svg {...base(p)}><path d="M9 4.5h6v4H9v-4ZM3.5 11h17v8.5h-17V11Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
)
export const IconBold = (p: P) => (
  <svg {...base(p)}><path d="M7 4.5h6a3.75 3.75 0 0 1 0 7.5H7v-7.5ZM7 12h6.75a3.75 3.75 0 0 1 0 7.5H7V12Z" fill="currentColor"/></svg>
)
export const IconItalic = (p: P) => (
  <svg {...base(p)}><path d="M10 4.5h7M7 19.5h7M14 4.5l-4 15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>
)
export const IconLink = (p: P) => (
  <svg {...base(p)}><path d="M10.5 13.5a3.5 3.5 0 0 0 5 0l2.5-2.5a3.54 3.54 0 0 0-5-5L11.75 7.75" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><path d="M13.5 10.5a3.5 3.5 0 0 0-5 0L6 13a3.54 3.54 0 0 0 5 5l1.25-1.25" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
)
export const IconQuote = (p: P) => (
  <svg {...base(p)}><path d="M9.5 6c-2.8 1-4.5 3.4-4.5 6.5V18h5.5v-5.5H7.5c0-2 .7-3.4 2.6-4.2L9.5 6Zm9 0c-2.8 1-4.5 3.4-4.5 6.5V18h5.5v-5.5h-3c0-2 .7-3.4 2.6-4.2L18.5 6Z" fill="currentColor"/></svg>
)
export const IconPullQuote = (p: P) => (
  <svg {...base(p)}><path d="M4 5.5h16M4 18.5h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M7 9.5h10M7 14h10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/></svg>
)
export const IconTitleLarge = (p: P) => (
  <svg {...base(p)}><path d="M4 6h16M12 6v13" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/></svg>
)
export const IconTitleSmall = (p: P) => (
  <svg {...base(p)}><path d="M6.5 8.5h11M12 8.5V18" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/></svg>
)
export const IconNote = (p: P) => (
  <svg {...base(p)}><path d="M4.5 5.5h15a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-8L8 19v-3.5H4.5a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
)
export const IconSun = (p: P) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
)
export const IconMoon = (p: P) => (
  <svg {...base(p)}><path d="M20 14.2A8.2 8.2 0 0 1 9.8 4 8.5 8.5 0 1 0 20 14.2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
)
export const IconVerified = (p: P) => (
  <svg {...base({ size: 16, ...p })} viewBox="0 0 16 16"><path d="M8 .8 9.9 2.5l2.5-.3.9 2.4 2.2 1.3-1 2.3 1 2.3-2.2 1.3-.9 2.4-2.5-.3L8 15.2l-1.9-1.7-2.5.3-.9-2.4L.5 10.1l1-2.3-1-2.3 2.2-1.3.9-2.4 2.5.3L8 .8Z" fill="#1d9bf0"/><path d="m5 8 2.2 2.2L11 6.4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
)
