import { randomBytes, scrypt as _scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'
import { cookies } from 'next/headers'
import { cache } from 'react'
import { prisma } from './db'

const scrypt = promisify(_scrypt) as (p: string, s: Buffer, l: number) => Promise<Buffer>
const COOKIE = 'ascend_session'
const MAX_AGE = 60 * 60 * 24 * 30 // 30 days

/** scrypt via node:crypto — no native bcrypt dep, no ESM/bundler footguns. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16)
  const key = await scrypt(password, salt, 64)
  return `scrypt$${salt.toString('hex')}$${key.toString('hex')}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, saltHex, keyHex] = stored.split('$')
  if (scheme !== 'scrypt' || !saltHex || !keyHex) return false
  const key = await scrypt(password, Buffer.from(saltHex, 'hex'), 64)
  const expected = Buffer.from(keyHex, 'hex')
  return key.length === expected.length && timingSafeEqual(key, expected)
}

export async function createSession(userId: string) {
  const session = await prisma.session.create({
    data: { userId, expiresAt: new Date(Date.now() + MAX_AGE * 1000) },
  })
  const jar = await cookies()
  jar.set(COOKIE, session.id, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE,
  })
  return session
}

export async function destroySession() {
  const jar = await cookies()
  const id = jar.get(COOKIE)?.value
  if (id) await prisma.session.delete({ where: { id } }).catch(() => {})
  jar.delete(COOKIE)
}

/** Cached per-request so repeated calls in one render hit the DB once. */
export const getCurrentUser = cache(async () => {
  const jar = await cookies()
  const id = jar.get(COOKIE)?.value
  if (!id) return null
  const session = await prisma.session.findUnique({ where: { id }, include: { user: true } })
  if (!session || session.expiresAt < new Date()) return null
  return session.user
})

export async function requireUser() {
  const user = await getCurrentUser()
  if (!user) throw new Error('UNAUTHORIZED')
  return user
}
