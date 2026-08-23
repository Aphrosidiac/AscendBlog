import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { guardWrites } from '@/lib/guard'

export async function PATCH(req: Request) {
  const gate = await guardWrites()
  if (gate) return gate

  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const b = await req.json().catch(() => ({}))
  const name = String(b?.name ?? '').trim()
  if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: name.slice(0, 80),
      bio: String(b?.bio ?? '').slice(0, 160) || null,
      about: String(b?.about ?? '').slice(0, 4000) || null,
      pronouns: String(b?.pronouns ?? '').slice(0, 40) || null,
    },
  })
  return NextResponse.json({ ok: true })
}
