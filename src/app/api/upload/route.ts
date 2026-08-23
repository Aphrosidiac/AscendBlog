import { NextResponse } from 'next/server'
import { createHash } from 'node:crypto'
import { writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { getCurrentUser } from '@/lib/auth'

const MAX_BYTES = 8 * 1024 * 1024 // 8MB
const ALLOWED: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/avif': 'avif',
}

/**
 * Stores an uploaded image under /public/uploads, named by content hash so the
 * same file uploaded twice costs one copy. Type is taken from the sniffed
 * bytes, never from the client-supplied mime.
 */
function sniff(buf: Buffer): string | null {
  if (buf.length < 12) return null
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg'
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png'
  if (buf.subarray(0, 6).toString('ascii') === 'GIF89a' || buf.subarray(0, 6).toString('ascii') === 'GIF87a') return 'image/gif'
  if (buf.subarray(0, 4).toString('ascii') === 'RIFF' && buf.subarray(8, 12).toString('ascii') === 'WEBP') return 'image/webp'
  if (buf.subarray(4, 8).toString('ascii') === 'ftyp' && buf.subarray(8, 12).toString('ascii').startsWith('avif')) return 'image/avif'
  return null
}

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const form = await req.formData().catch(() => null)
  const file = form?.get('file')
  if (!(file instanceof File)) return NextResponse.json({ error: 'no file' }, { status: 400 })
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'Images must be 8MB or smaller.' }, { status: 413 })
  }

  const buf = Buffer.from(await file.arrayBuffer())
  const mime = sniff(buf)
  if (!mime || !ALLOWED[mime]) {
    return NextResponse.json({ error: 'That file is not a supported image.' }, { status: 415 })
  }

  const hash = createHash('sha256').update(buf).digest('hex').slice(0, 32)
  const name = `${hash}.${ALLOWED[mime]}`
  const dir = path.join(process.cwd(), 'public', 'uploads')
  await mkdir(dir, { recursive: true })
  await writeFile(path.join(dir, name), buf)

  return NextResponse.json({ url: `/uploads/${name}`, width: null, height: null }, { status: 201 })
}
