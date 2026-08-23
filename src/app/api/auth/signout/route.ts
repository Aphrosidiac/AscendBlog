import { NextResponse } from 'next/server'
import { destroySession } from '@/lib/auth'
import { guardWrites } from '@/lib/guard'

export async function POST(req: Request) {
  const gate = await guardWrites()
  if (gate) return gate

  await destroySession()
  return NextResponse.redirect(new URL('/', req.url), { status: 303 })
}
