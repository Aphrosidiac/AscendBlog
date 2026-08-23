# Ascend

A long-form publishing platform — reading, writing, responses, highlights, lists,
publications, and topics.

Built to match the interaction model and layout geometry of a mature publishing
product, with Ascend's own branding and typography. All layout values in
`src/app/globals.css` were measured from rendered pages rather than guessed; the
research notes are in `_research/`.

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS v4, token layer in `src/app/globals.css` |
| Database | PostgreSQL via Prisma 7 (`prisma-client` generator + `@prisma/adapter-pg`) |
| Editor | TipTap (ProseMirror) |
| Auth | Session cookies, `node:crypto` scrypt — no native password dep |
| Fonts | Instrument Sans, Source Serif 4, Newsreader, Outfit (all OFL, self-hosted) |

## Running it

```bash
npm install
createdb ascendblog
cp .env.example .env      # then set DATABASE_URL
npx prisma migrate dev
npm run seed
npm run dev               # http://localhost:3122
```

Seeded sign-in: `rikaidrawings@gmail.com` / `ascend123`

## Scripts

| command | what it does |
|---|---|
| `npm run dev` | dev server on :3122 |
| `npm run seed` | reset and reseed the database |
| `npm run smoke` | request every route, assert none 4xx/5xx |
| `npx tsx scripts/functional.ts` | exercise every API: claps, follows, responses, publish, authz |

## What's built

**Reading** — feed (For you / Featured / followed topics), story pages, member-only
badging, reading history, text-to-speech, share and more menus.

**Writing** — TipTap editor with the insert menu (image, embed, video, code, divider),
selection toolbar (bold, italic, link, headings, quote, list), autosave, and a publish
flow with topics and member-only toggle.

**Social** — claps (press-and-hold, capped at 50 per reader), threaded responses,
follows, topic follows, highlights, reading lists, notifications.

**Surfaces** — profile (Home/Lists/About), publications, topic pages, search across
stories/people/publications/topics, library, stats, settings, explore.

## Typography

Substitutes for the original's proprietary faces were chosen by measuring advance
width, cap-height and x-height against the originals rather than by eye — see
`_research/03-fonts.md`. Instrument Sans came within 2.3% of the target's advance
width where Inter, the obvious default, ran 6.9% wide and would have broken every
headline wrap.
