type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()
const MAX_KEYS = 10_000

/**
 * Fixed-window counter, in process memory.
 *
 * That is deliberate for a single-node deploy (PM2 fork behind nginx) and it is
 * also the limitation: counters are per-process and reset on restart. Running
 * more than one instance means moving this to Redis or Postgres.
 */
export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now()

  // Cheap sweep so an attacker cycling keys can't grow the map without bound.
  if (buckets.size > MAX_KEYS) {
    for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k)
    if (buckets.size > MAX_KEYS) buckets.clear()
  }

  const bucket = buckets.get(key)
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, retryAfter: 0 }
  }

  bucket.count += 1
  if (bucket.count > limit) {
    return { ok: false, retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) }
  }
  return { ok: true, retryAfter: 0 }
}

/** Best-effort client address; nginx and Cloudflare both front this in prod. */
export function clientIp(headers: Headers): string {
  return (
    headers.get('cf-connecting-ip') ??
    headers.get('x-real-ip') ??
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'local'
  )
}
