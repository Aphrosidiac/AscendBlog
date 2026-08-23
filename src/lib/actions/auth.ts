'use server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { prisma } from '@/lib/db'
import { createSession, destroySession, hashPassword, verifyPassword } from '@/lib/auth'
import { clientIp, rateLimit } from '@/lib/ratelimit'

const USERNAME = /^[a-z0-9_]{3,24}$/

// A real scrypt hash of a value nobody can supply. Verifying against this for
// unknown emails keeps the timing of a miss the same as the timing of a hit.
const DUMMY_HASH =
  'scrypt$00000000000000000000000000000000$' + '0'.repeat(128)

export type AuthState = { error?: string } | undefined

export async function signUp(_prev: AuthState, form: FormData): Promise<AuthState> {
  if (!rateLimit(`signup:${clientIp(await headers())}`, 5, 60 * 60_000).ok) {
    return { error: 'Too many accounts created from here. Try again later.' }
  }
  const name = String(form.get('name') ?? '').trim()
  const email = String(form.get('email') ?? '').trim().toLowerCase()
  const username = String(form.get('username') ?? '').trim().toLowerCase()
  const password = String(form.get('password') ?? '')

  if (!name) return { error: 'Please enter your name.' }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: 'Please enter a valid email address.' }
  if (!USERNAME.test(username)) return { error: 'Usernames use 3–24 lowercase letters, numbers or underscores.' }
  if (password.length < 8) return { error: 'Passwords need at least 8 characters.' }

  const clash = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
    select: { email: true, username: true },
  })
  if (clash?.email === email) return { error: 'That email is already registered.' }
  if (clash?.username === username) return { error: 'That username is taken.' }

  const user = await prisma.user.create({
    data: { name, email, username, passwordHash: await hashPassword(password) },
  })
  await prisma.readingList.create({ data: { userId: user.id, name: 'Reading list', isPrivate: true } })
  await createSession(user.id)
  redirect('/')
}

export async function signIn(_prev: AuthState, form: FormData): Promise<AuthState> {
  const email = String(form.get('email') ?? '').trim().toLowerCase()
  const password = String(form.get('password') ?? '')

  // Throttle per address and per targeted account, so neither spraying one
  // account nor spreading across many gets an unlimited number of guesses.
  const ip = clientIp(await headers())
  for (const key of [`signin:ip:${ip}`, `signin:email:${email}`]) {
    if (!rateLimit(key, 10, 15 * 60_000).ok) {
      return { error: 'Too many sign-in attempts. Try again in a few minutes.' }
    }
  }

  const user = await prisma.user.findUnique({ where: { email } })
  // Same message either way so the form can't be used to enumerate accounts —
  // and hash even when there is no such user, so the response time can't be
  // used to tell the two cases apart either.
  const stored = user?.passwordHash ?? DUMMY_HASH
  const ok = await verifyPassword(password, stored)
  if (!user || !ok) {
    return { error: 'That email and password combination is not right.' }
  }
  await createSession(user.id)
  redirect('/')
}

export async function signOut() {
  await destroySession()
  redirect('/')
}
