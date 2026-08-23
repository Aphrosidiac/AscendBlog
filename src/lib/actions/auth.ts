'use server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { createSession, destroySession, hashPassword, verifyPassword } from '@/lib/auth'

const USERNAME = /^[a-z0-9_]{3,24}$/

export type AuthState = { error?: string } | undefined

export async function signUp(_prev: AuthState, form: FormData): Promise<AuthState> {
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
  const user = await prisma.user.findUnique({ where: { email } })
  // Same message either way so the form can't be used to enumerate accounts.
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: 'That email and password combination is not right.' }
  }
  await createSession(user.id)
  redirect('/')
}

export async function signOut() {
  await destroySession()
  redirect('/')
}
