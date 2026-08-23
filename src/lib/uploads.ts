import path from 'node:path'

/**
 * Where uploaded media lives on disk.
 *
 * Deliberately NOT `public/` — anything under `public/` is part of the build
 * output, so a deploy that replaces the directory takes every uploaded image
 * with it. This points at a path that can be a mounted volume, and the files
 * are served back by `src/app/uploads/[...file]/route.ts`.
 *
 * `UPLOADS_DIR` may be absolute (a volume mount) or relative to the working
 * directory (the local default).
 */
export function uploadsDir(): string {
  // path.resolve() rather than path.join(process.cwd(), …): a literal
  // process.cwd() next to filesystem calls makes Next's build tracer give up
  // and trace the whole project into the output. resolve() falls back to the
  // working directory for a relative path anyway.
  return path.resolve(process.env.UPLOADS_DIR?.trim() || 'var/uploads')
}

/** Extensions this app will store and serve, with the type to serve them as. */
export const MEDIA_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  avif: 'image/avif',
}

/**
 * Resolves a request path inside the uploads directory, or null if it escapes.
 *
 * Names are content hashes we generate, so traversal shouldn't be reachable —
 * but this is the one place user input touches the filesystem, so it is checked
 * on the resolved path rather than on the string that was handed in.
 */
export function resolveUpload(segments: string[]): { file: string; type: string } | null {
  if (segments.length === 0) return null
  const dir = path.resolve(uploadsDir())
  const file = path.resolve(dir, ...segments)
  if (file !== dir && !file.startsWith(dir + path.sep)) return null

  const ext = path.extname(file).slice(1).toLowerCase()
  const type = MEDIA_TYPES[ext]
  if (!type) return null

  return { file, type }
}
