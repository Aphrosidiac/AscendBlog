import { NextResponse } from 'next/server'
import { readFile, stat } from 'node:fs/promises'
import { resolveUpload } from '@/lib/uploads'

/**
 * Serves uploaded media from the uploads directory.
 *
 * These used to be static files under `public/`. They are served by the app now
 * so the directory can live outside the build output — see `src/lib/uploads.ts`.
 * In production nginx can short-circuit this with an `alias` on the same path;
 * the route is the fallback that makes it work without any web-server config.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ file: string[] }> }) {
  const { file: segments } = await params
  const target = resolveUpload(segments)
  if (!target) return new NextResponse('Not found', { status: 404 })

  const info = await stat(target.file).catch(() => null)
  if (!info?.isFile()) return new NextResponse('Not found', { status: 404 })

  const body = await readFile(target.file)
  return new NextResponse(body as unknown as BodyInit, {
    headers: {
      'content-type': target.type,
      'content-length': String(info.size),
      // Names are content hashes, so a given URL can never change.
      'cache-control': 'public, max-age=31536000, immutable',
      'x-content-type-options': 'nosniff',
    },
  })
}
