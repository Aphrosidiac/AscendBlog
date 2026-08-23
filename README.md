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
| `npm run smoke` | request every route, assert none 4xx/5xx (40 routes) |
| `npx tsx scripts/functional.ts` | 74 assertions over every API. Self-cleaning: leaves no residue |

## What's built

**Reading** — feed (For you / Featured / followed topics), story pages, member-only
badging, reading history, text-to-speech, share and more menus.

**Writing** — TipTap editor with the insert menu (image upload, embed, video, code,
divider), selection toolbar (bold, italic, link, headings, quote, list), autosave, and
a publish flow with topics and a member-only toggle. Uploads are stored under
`public/uploads` named by content hash, with the type taken from sniffed bytes rather
than the client's mime.

**Social** — claps (press-and-hold, capped at 50 per reader), threaded responses,
follows, topic follows, highlights, reading lists with a save-to-list picker,
reposts, mutes, "show less like this", reporting, notifications.

Mutes and "show less" genuinely change the feed — and remove that author from
Staff Picks and Who-to-follow too, not just the story list.

**Surfaces** — profile (Home/Lists/About), publications, topic pages, search across
stories/people/publications/topics, library, stats, settings, explore.

## Typography

Substitutes for the original's proprietary faces were chosen by measuring advance
width, cap-height and x-height against the originals rather than by eye — see
`_research/03-fonts.md`. Instrument Sans came within 2.3% of the target's advance
width where Inter, the obvious default, ran 6.9% wide and would have broken every
headline wrap.


## Security

Story HTML is **sanitised on write** in `src/lib/sanitize.ts`, against an allowlist
matching what the editor can produce. The editor shapes what an author types, but
the editor is not the boundary — `PATCH /api/posts/[id]` takes whatever a client
sends, and that body is later handed to `dangerouslySetInnerHTML`. It is sanitised
again on read, so rows written before the guard are covered too.

`src/proxy.ts` sets a per-request nonce CSP (`strict-dynamic`, no `unsafe-inline`
for scripts); the static headers are in `next.config.ts`. Sign-in is throttled per
address and per targeted account, and verifies against a dummy hash when the email
is unknown so response time can't be used to tell a real account from a missing
one. Write endpoints are throttled via `guardWrites()`.

That throttling is **in-process memory**, which suits a single PM2 fork behind
nginx and is exactly the limit: counters are per-process and reset on restart.
More than one instance means moving it to Redis or Postgres. `next dev` also
re-evaluates route modules on recompile, which resets the counters — only a
production build gives a true reading.

## Uploaded media

Uploads are written to `UPLOADS_DIR` (default `./var/uploads`, gitignored) and
served back by `src/app/uploads/[...file]/route.ts`. They are deliberately **not**
under `public/`: anything there is part of the build output, so a deploy that
replaces the directory takes every uploaded image with it.

Filenames are content hashes, so a URL's bytes can never change — they are served
`immutable` with a one-year max-age, and re-uploading the same image reuses the
existing file.

To put them on a volume:

```bash
sudo mkdir -p /var/lib/ascendblog/uploads
sudo chown -R $USER:$USER /var/lib/ascendblog/uploads
echo 'UPLOADS_DIR="/var/lib/ascendblog/uploads"' >> .env
```

The app serves `/uploads/*` on its own, so nothing else is required. nginx can
take that path over if you would rather it never touched Node:

```nginx
location /uploads/ {
    alias /var/lib/ascendblog/uploads/;
    access_log off;
    expires 1y;
    add_header Cache-Control "public, immutable";
    add_header X-Content-Type-Options nosniff;
}
```

Back the directory up separately — it is the one piece of state that is neither in
git nor in Postgres.

## Things worth knowing

- The **member-only paywall truncates server-side**. A CSS-blur gate would ship the
  full text to non-members; the tests assert a later paragraph is absent when gated
  and present when not.
- **Reseeding truncates `Session`**, so `npm run seed` signs you out of the browser.
- Prisma 7 moved the datasource URL out of `schema.prisma` into `prisma.config.ts`,
  and `migrate` does not regenerate the client — run `npx prisma generate` after a
  migration or new models are `undefined` at runtime.
- **Highlights are painted by walking text nodes**, not by rebuilding the paragraph
  from `textContent`. The simpler version flattens every link, bold and italic in
  any paragraph that carries a highlight.
- The editor's autosave is debounced, so it **flushes on `pagehide` with
  `keepalive`**. Without that, closing the tab drops the last second of typing —
  a plain `fetch` is cancelled as the document tears down.
- Editor toolbars use `useEditorState`, not a forced re-render on every
  `transaction`. Rendering the bubble repositions it, that dispatches a
  transaction, and the two feed each other until React bails out with "Maximum
  update depth exceeded".
- Reading an env-configured directory is dynamic filesystem access, so Next's
  build tracer traces the whole project for the two upload routes. Left alone that
  sweeps `var/uploads` into the build output — the exact coupling the volume
  exists to break — so `next.config.ts` excludes it. Only matters for
  `output: 'standalone'`; `next start` from a checkout ignores the trace.
