import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) })
const BASE = 'http://localhost:3122'

let pass = 0, fail = 0
function check(name: string, ok: boolean, detail = '') {
  if (ok) { pass++; console.log(`  ok   ${name}`) }
  else { fail++; console.log(`FAIL   ${name} ${detail}`) }
}

async function main() {
  const me = await prisma.user.findUniqueOrThrow({ where: { username: 'fakhrul' } })
  const other = await prisma.user.findFirstOrThrow({ where: { username: 'amira_z' } })
  const session = await prisma.session.create({ data: { userId: me.id, expiresAt: new Date(Date.now() + 3600_000) } })
  const cookie = `ascend_session=${session.id}`
  const H = { cookie, 'content-type': 'application/json' }

  const post = await prisma.post.findFirstOrThrow({ where: { status: 'PUBLISHED', authorId: other.id } })

  // ── CLAP ──────────────────────────────────────────────
  // Clapping SETS this reader's tally rather than incrementing it, so the
  // assertion below needs a known starting point to be re-runnable.
  await prisma.clap.deleteMany({ where: { userId: me.id, postId: post.id } })
  const before = await prisma.clap.aggregate({ where: { postId: post.id }, _sum: { count: true } })
  const clapRes = await fetch(`${BASE}/api/posts/${post.id}/clap`, { method: 'POST', headers: H, body: JSON.stringify({ count: 7 }) })
  const clapJson = await clapRes.json()
  check('clap: accepted', clapRes.ok)
  check('clap: mine recorded as 7', clapJson.mine === 7, JSON.stringify(clapJson))
  check('clap: total increased', clapJson.total === (before._sum.count ?? 0) + 7, `${clapJson.total} vs ${(before._sum.count ?? 0) + 7}`)

  const capRes = await fetch(`${BASE}/api/posts/${post.id}/clap`, { method: 'POST', headers: H, body: JSON.stringify({ count: 999 }) })
  const capJson = await capRes.json()
  check('clap: capped at 50', capJson.mine === 50, JSON.stringify(capJson))

  // ── BOOKMARK ──────────────────────────────────────────
  const bmOn = await fetch(`${BASE}/api/posts/${post.id}/bookmark`, { method: 'POST', headers: H })
  check('bookmark: save ok', bmOn.ok)
  const savedRow = await prisma.listItem.findFirst({ where: { postId: post.id, list: { userId: me.id } } })
  check('bookmark: row created in default list', Boolean(savedRow))
  const bmOff = await fetch(`${BASE}/api/posts/${post.id}/bookmark`, { method: 'DELETE', headers: H })
  check('bookmark: unsave ok', bmOff.ok)
  const goneRow = await prisma.listItem.findFirst({ where: { postId: post.id, list: { userId: me.id } } })
  check('bookmark: row removed', !goneRow)

  // ── FOLLOW ────────────────────────────────────────────
  await prisma.follow.deleteMany({ where: { followerId: me.id, followingId: other.id } })
  const fOn = await fetch(`${BASE}/api/users/${other.id}/follow`, { method: 'POST', headers: H })
  check('follow: ok', fOn.ok)
  check('follow: row exists', Boolean(await prisma.follow.findUnique({ where: { followerId_followingId: { followerId: me.id, followingId: other.id } } })))
  const selfFollow = await fetch(`${BASE}/api/users/${me.id}/follow`, { method: 'POST', headers: H })
  check('follow: cannot follow self', selfFollow.status === 400)
  const fOff = await fetch(`${BASE}/api/users/${other.id}/follow`, { method: 'DELETE', headers: H })
  check('unfollow: ok', fOff.ok)

  // ── RESPONSE ──────────────────────────────────────────
  const madeResponses: string[] = []
  const rRes = await fetch(`${BASE}/api/posts/${post.id}/responses`, { method: 'POST', headers: H, body: JSON.stringify({ text: 'A test response.\n\nSecond paragraph.' }) })
  const rJson = await rRes.json()
  if (rJson?.id) madeResponses.push(rJson.id)
  check('response: created', rRes.status === 201, JSON.stringify(rJson))
  const created = await prisma.response.findUnique({ where: { id: rJson.id } })
  check('response: two paragraphs rendered', (created?.contentHtml.match(/<p>/g) ?? []).length === 2, created?.contentHtml)

  const xssRes = await fetch(`${BASE}/api/posts/${post.id}/responses`, { method: 'POST', headers: H, body: JSON.stringify({ text: '<script>alert(1)</script>' }) })
  const xssJson = await xssRes.json()
  if (xssJson?.id) madeResponses.push(xssJson.id)
  const xssRow = await prisma.response.findUnique({ where: { id: xssJson.id } })
  check('response: script tag escaped', !xssRow?.contentHtml.includes('<script>'), xssRow?.contentHtml)

  const reply = await fetch(`${BASE}/api/posts/${post.id}/responses`, { method: 'POST', headers: H, body: JSON.stringify({ text: 'A nested reply.', parentId: rJson.id }) })
  check('response: nested reply created', reply.status === 201)
  const replyJson = await reply.json().catch(() => null)
  if (replyJson?.id) madeResponses.push(replyJson.id)

  const badParent = await fetch(`${BASE}/api/posts/${post.id}/responses`, { method: 'POST', headers: H, body: JSON.stringify({ text: 'x', parentId: 'nonexistent' }) })
  check('response: rejects bad parent', badParent.status === 400)

  const emptyRes = await fetch(`${BASE}/api/posts/${post.id}/responses`, { method: 'POST', headers: H, body: JSON.stringify({ text: '   ' }) })
  check('response: rejects empty', emptyRes.status === 400)

  // ── HIGHLIGHT ─────────────────────────────────────────
  const hRes = await fetch(`${BASE}/api/posts/${post.id}/highlights`, { method: 'POST', headers: H, body: JSON.stringify({ text: 'some text', paraIndex: 0, startOff: 0, endOff: 9 }) })
  check('highlight: created', hRes.status === 201)
  const badH = await fetch(`${BASE}/api/posts/${post.id}/highlights`, { method: 'POST', headers: H, body: JSON.stringify({ text: 'x', paraIndex: 0, startOff: 5, endOff: 2 }) })
  check('highlight: rejects inverted range', badH.status === 400)

  // ── LISTS ─────────────────────────────────────────────
  const lRes = await fetch(`${BASE}/api/lists`, { method: 'POST', headers: H, body: JSON.stringify({ name: 'Test list', isPrivate: true }) })
  check('list: created', lRes.status === 201)
  const lBad = await fetch(`${BASE}/api/lists`, { method: 'POST', headers: H, body: JSON.stringify({ name: '  ' }) })
  check('list: rejects blank name', lBad.status === 400)

  // ── SAVE-TO-LIST POPOVER ──────────────────────────────
  const listsRes = await fetch(`${BASE}/api/posts/${post.id}/lists`, { headers: H })
  const listsJson = await listsRes.json()
  check('lists: popover data returns rows', Array.isArray(listsJson.lists) && listsJson.lists.length > 0)
  const targetList = listsJson.lists[0]
  const addRes = await fetch(`${BASE}/api/posts/${post.id}/lists`, { method: 'PUT', headers: H, body: JSON.stringify({ listId: targetList.id, add: true }) })
  const addJson = await addRes.json()
  check('lists: add to specific list', addRes.ok && addJson.contains === true, JSON.stringify(addJson))
  check('lists: savedAnywhere true after add', addJson.savedAnywhere === true)
  const remRes = await fetch(`${BASE}/api/posts/${post.id}/lists`, { method: 'PUT', headers: H, body: JSON.stringify({ listId: targetList.id, add: false }) })
  const remJson = await remRes.json()
  check('lists: remove from specific list', remRes.ok && remJson.contains === false)

  // another user's list must not be writable
  const otherList = await prisma.readingList.findFirstOrThrow({ where: { userId: other.id } })
  const foreign = await fetch(`${BASE}/api/posts/${post.id}/lists`, { method: 'PUT', headers: H, body: JSON.stringify({ listId: otherList.id, add: true }) })
  check('authz: cannot write into another user’s list', foreign.status === 404, String(foreign.status))

  // ── PROFILE ───────────────────────────────────────────
  const pRes = await fetch(`${BASE}/api/me`, { method: 'PATCH', headers: H, body: JSON.stringify({ name: 'Fakhrul', bio: 'Updated bio', about: 'About text', pronouns: 'he/him' }) })
  check('profile: updated', pRes.ok)
  const fresh = await prisma.user.findUniqueOrThrow({ where: { id: me.id } })
  check('profile: bio persisted', fresh.bio === 'Updated bio', fresh.bio ?? '')

  // ── DRAFT → PUBLISH ───────────────────────────────────
  const draft = await prisma.post.create({ data: { authorId: me.id, slug: `t-${Date.now()}`, title: '', contentHtml: '<p></p>' } })
  const noTitle = await fetch(`${BASE}/api/posts/${draft.id}/publish`, { method: 'POST', headers: H, body: JSON.stringify({ tags: [] }) })
  check('publish: blocked without a title', noTitle.status === 400)

  await fetch(`${BASE}/api/posts/${draft.id}`, { method: 'PATCH', headers: H, body: JSON.stringify({ title: 'A Functional Test Story', contentHtml: '<p>' + 'word '.repeat(300) + '</p>' }) })
  const afterPatch = await prisma.post.findUniqueOrThrow({ where: { id: draft.id } })
  check('autosave: title saved', afterPatch.title === 'A Functional Test Story')
  check('autosave: reading time computed', afterPatch.readingTime === 1, String(afterPatch.readingTime))
  check('autosave: excerpt generated', afterPatch.excerpt.length > 0)

  const tag = await prisma.tag.findFirstOrThrow()
  const pubRes = await fetch(`${BASE}/api/posts/${draft.id}/publish`, { method: 'POST', headers: H, body: JSON.stringify({ tags: [tag.slug], isMemberOnly: false }) })
  const pubJson = await pubRes.json()
  check('publish: succeeds with a title', pubRes.ok, JSON.stringify(pubJson))
  check('publish: returns a slug path', typeof pubJson.path === 'string' && pubJson.path.includes('/@fakhrul/'), JSON.stringify(pubJson))
  const published = await prisma.post.findUniqueOrThrow({ where: { id: draft.id }, include: { tags: true } })
  check('publish: status is PUBLISHED', published.status === 'PUBLISHED')
  check('publish: tag attached', published.tags.length === 1)
  check('publish: slug is human readable', published.slug.startsWith('a-functional-test-story-'), published.slug)

  // published story is reachable
  const storyRes = await fetch(`${BASE}${pubJson.path}`, { headers: { cookie } })
  check('publish: story page loads', storyRes.ok, String(storyRes.status))

  // ── AUTHORISATION ─────────────────────────────────────
  const otherPost = await prisma.post.findFirstOrThrow({ where: { authorId: other.id } })
  const forbidden = await fetch(`${BASE}/api/posts/${otherPost.id}`, { method: 'PATCH', headers: H, body: JSON.stringify({ title: 'hacked' }) })
  check('authz: cannot edit another author’s post', forbidden.status === 403)
  const forbiddenDel = await fetch(`${BASE}/api/posts/${otherPost.id}`, { method: 'DELETE', headers: H })
  check('authz: cannot delete another author’s post', forbiddenDel.status === 403)
  const anon = await fetch(`${BASE}/api/posts/${post.id}/clap`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ count: 1 }) })
  check('authz: anonymous clap rejected', anon.status === 401)

  // ── TAG FOLLOW ────────────────────────────────────────
  const tfOn = await fetch(`${BASE}/api/tags/${tag.id}/follow`, { method: 'POST', headers: H })
  check('tag follow: ok', tfOn.ok)
  const tfOff = await fetch(`${BASE}/api/tags/${tag.id}/follow`, { method: 'DELETE', headers: H })
  check('tag unfollow: ok', tfOff.ok)

  // ── NOTIFICATIONS ─────────────────────────────────────
  const notifs = await prisma.notification.count({ where: { userId: other.id } })
  check('notify: author notified by clap/response', notifs > 0, String(notifs))

  // ── REPOST ────────────────────────────────────────────
  await prisma.repost.deleteMany({ where: { userId: me.id, postId: post.id } })
  const rpOn = await fetch(`${BASE}/api/posts/${post.id}/repost`, { method: 'POST', headers: H, body: JSON.stringify({ comment: 'Worth reading.' }) })
  const rpJson = await rpOn.json()
  check('repost: created', rpOn.ok && rpJson.reposted === true, JSON.stringify(rpJson))
  check('repost: count reflects it', rpJson.count >= 1)
  const rpRow = await prisma.repost.findUnique({ where: { userId_postId: { userId: me.id, postId: post.id } } })
  check('repost: comment stored', rpRow?.comment === 'Worth reading.')
  const rpOff = await fetch(`${BASE}/api/posts/${post.id}/repost`, { method: 'DELETE', headers: H })
  check('repost: undone', rpOff.ok && (await rpOff.json()).reposted === false)

  // ── MUTE (must actually change the feed) ──────────────
  await prisma.mute.deleteMany({ where: { muterId: me.id } })
  const feedBefore = await fetch(`${BASE}/`, { headers: { cookie } }).then((r) => r.text())
  const otherTitle = post.title
  check('mute: story present before muting', feedBefore.includes(otherTitle.slice(0, 40)))

  const muteOn = await fetch(`${BASE}/api/users/${other.id}/mute`, { method: 'POST', headers: H })
  check('mute: ok', muteOn.ok)
  const feedMuted = await fetch(`${BASE}/`, { headers: { cookie } }).then((r) => r.text())
  check('mute: muted author is gone from the feed', !feedMuted.includes(otherTitle.slice(0, 40)))
  const selfMute = await fetch(`${BASE}/api/users/${me.id}/mute`, { method: 'POST', headers: H })
  check('mute: cannot mute yourself', selfMute.status === 400)
  await fetch(`${BASE}/api/users/${other.id}/mute`, { method: 'DELETE', headers: H })
  const feedUnmuted = await fetch(`${BASE}/`, { headers: { cookie } }).then((r) => r.text())
  check('mute: story returns after unmuting', feedUnmuted.includes(otherTitle.slice(0, 40)))

  // ── SHOW LESS LIKE THIS ───────────────────────────────
  await prisma.notInterested.deleteMany({ where: { userId: me.id } })
  const niOn = await fetch(`${BASE}/api/posts/${post.id}/not-interested`, { method: 'POST', headers: H })
  check('show less: ok', niOn.ok)
  const feedHidden = await fetch(`${BASE}/`, { headers: { cookie } }).then((r) => r.text())
  check('show less: story drops out of the feed', !feedHidden.includes(otherTitle.slice(0, 40)))
  await fetch(`${BASE}/api/posts/${post.id}/not-interested`, { method: 'DELETE', headers: H })
  const feedBack = await fetch(`${BASE}/`, { headers: { cookie } }).then((r) => r.text())
  check('show less: undo restores it', feedBack.includes(otherTitle.slice(0, 40)))

  // ── REPORT ────────────────────────────────────────────
  const repOk = await fetch(`${BASE}/api/posts/${post.id}/report`, { method: 'POST', headers: H, body: JSON.stringify({ reason: 'spam', detail: 'test' }) })
  check('report: accepted', repOk.ok)
  check('report: row stored', (await prisma.report.count({ where: { postId: post.id, userId: me.id } })) > 0)
  const repBad = await fetch(`${BASE}/api/posts/${post.id}/report`, { method: 'POST', headers: H, body: JSON.stringify({ reason: 'nonsense' }) })
  check('report: rejects unknown reason', repBad.status === 400)

  // ── IMAGE UPLOAD ──────────────────────────────────────
  // 1x1 transparent PNG
  const pngBytes = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64',
  )
  const upForm = new FormData()
  upForm.append('file', new Blob([new Uint8Array(pngBytes)], { type: 'image/png' }), 'dot.png')
  const upRes = await fetch(`${BASE}/api/upload`, { method: 'POST', headers: { cookie }, body: upForm })
  const upJson = await upRes.json()
  check('upload: png accepted', upRes.status === 201, JSON.stringify(upJson))
  check('upload: returns a served url', typeof upJson.url === 'string' && upJson.url.startsWith('/uploads/'))
  if (upJson.url) {
    const fetched = await fetch(BASE + upJson.url)
    check('upload: file is actually served back', fetched.ok, String(fetched.status))
  }

  // same bytes must not create a second file (content-hash naming)
  const dupForm = new FormData()
  dupForm.append('file', new Blob([new Uint8Array(pngBytes)], { type: 'image/png' }), 'again.png')
  const dupRes = await fetch(`${BASE}/api/upload`, { method: 'POST', headers: { cookie }, body: dupForm })
  const dupJson = await dupRes.json()
  check('upload: identical bytes reuse the same name', dupJson.url === upJson.url, `${dupJson.url} vs ${upJson.url}`)

  // a script claiming to be a png must be rejected on sniffed bytes
  const evilForm = new FormData()
  evilForm.append('file', new Blob([new TextEncoder().encode('<?php system($_GET[0]); ?>')], { type: 'image/png' }), 'evil.png')
  const evilRes = await fetch(`${BASE}/api/upload`, { method: 'POST', headers: { cookie }, body: evilForm })
  check('upload: rejects a non-image lying about its mime', evilRes.status === 415, String(evilRes.status))

  const anonForm = new FormData()
  anonForm.append('file', new Blob([new Uint8Array(pngBytes)], { type: 'image/png' }), 'dot.png')
  const anonUp = await fetch(`${BASE}/api/upload`, { method: 'POST', body: anonForm })
  check('upload: anonymous upload rejected', anonUp.status === 401)

  // ── REPOSTS TAB ───────────────────────────────────────
  await fetch(`${BASE}/api/posts/${post.id}/repost`, { method: 'POST', headers: H, body: JSON.stringify({ comment: 'Reposting for the tab test.' }) })
  const repostsTab = await fetch(`${BASE}/@fakhrul?tab=reposts`, { headers: { cookie } }).then((r) => r.text())
  check('profile: reposts tab shows the reposted story', repostsTab.includes(post.title.slice(0, 40)))
  check('profile: reposts tab shows the comment', repostsTab.includes('Reposting for the tab test.'))
  await fetch(`${BASE}/api/posts/${post.id}/repost`, { method: 'DELETE', headers: H })

  // ── MEMBER-ONLY PAYWALL ───────────────────────────────
  const memberPost = await prisma.post.findFirst({
    where: { isMemberOnly: true, status: 'PUBLISHED' },
    include: { author: true },
  })
  if (memberPost) {
    const path = `/@${memberPost.author.username}/${memberPost.slug}`

    // author sees everything
    const authorSession = await prisma.session.create({ data: { userId: memberPost.authorId, expiresAt: new Date(Date.now() + 3600_000) } })
    const asAuthor = await fetch(BASE + path, { headers: { cookie: `ascend_session=${authorSession.id}` } })
    const authorHtml = await asAuthor.text()
    check('paywall: author reads their own story in full', !authorHtml.includes('Keep reading with a membership'))
    await prisma.session.delete({ where: { id: authorSession.id } })

    // a non-member is gated
    const reader = await prisma.user.findFirstOrThrow({ where: { id: { notIn: [memberPost.authorId] } } })
    const wasMember = reader.isMember
    await prisma.user.update({ where: { id: reader.id }, data: { isMember: false } })
    const rs = await prisma.session.create({ data: { userId: reader.id, expiresAt: new Date(Date.now() + 3600_000) } })
    const gated = await fetch(BASE + path, { headers: { cookie: `ascend_session=${rs.id}` } })
    const gatedHtml = await gated.text()
    check('paywall: non-member sees the gate', gatedHtml.includes('Keep reading with a membership'))
    // Counting every <p> on the page is meaningless (recommendations and
    // responses have their own). Assert on a phrase from a LATER paragraph:
    // it must be absent when gated and present when not.
    const paras = memberPost.contentHtml.match(/<p>([\s\S]*?)<\/p>/g) ?? []
    const latePara = paras[Math.min(5, paras.length - 1)] ?? ''
    const lateText = latePara.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).slice(0, 8).join(' ')
    check('paywall: later paragraphs withheld when gated', lateText.length > 0 && !gatedHtml.includes(lateText), lateText)
    const tail = memberPost.contentHtml.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).slice(-6).join(' ')
    check('paywall: closing text withheld from non-members', !gatedHtml.includes(tail), tail)

    // restore
    await prisma.user.update({ where: { id: reader.id }, data: { isMember: wasMember } })
    const asMember = await fetch(BASE + path, { headers: { cookie: `ascend_session=${rs.id}` } })
    const memberHtml = await asMember.text()
    check('paywall: member reads it in full', !memberHtml.includes('Keep reading with a membership'))
    const parasB = memberPost.contentHtml.match(/<p>([\s\S]*?)<\/p>/g) ?? []
    const lateB = (parasB[Math.min(5, parasB.length - 1)] ?? '').replace(/<[^>]*>/g, ' ').trim().split(/\s+/).slice(0, 8).join(' ')
    check('paywall: those same paragraphs ARE served to a member', lateB.length > 0 && memberHtml.includes(lateB), lateB)
    await prisma.session.delete({ where: { id: rs.id } })
  } else {
    check('paywall: a member-only story exists to test', false)
  }

  // cleanup — the suite must leave no residue, or repeat runs silently
  // accumulate junk in the author's responses and drafts.
  await prisma.response.deleteMany({ where: { id: { in: madeResponses } } })
  await prisma.highlight.deleteMany({ where: { userId: me.id, postId: post.id, text: 'some text' } })
  await prisma.readingList.deleteMany({ where: { userId: me.id, name: 'Test list' } })
  await prisma.post.deleteMany({ where: { authorId: me.id, title: 'A Functional Test Story' } })
  await prisma.report.deleteMany({ where: { userId: me.id } })
  await prisma.repost.deleteMany({ where: { userId: me.id } })
  await prisma.notInterested.deleteMany({ where: { userId: me.id } })
  await prisma.mute.deleteMany({ where: { muterId: me.id } })
  await prisma.post.delete({ where: { id: draft.id } }).catch(() => {})
  await prisma.session.delete({ where: { id: session.id } }).catch(() => {})

  console.log(`\n${pass} passed, ${fail} failed`)
  process.exitCode = fail ? 1 : 0
}
main().finally(() => prisma.$disconnect())
