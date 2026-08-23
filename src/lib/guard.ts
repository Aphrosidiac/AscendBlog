import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { clientIp, rateLimit } from './ratelimit'

/**
 * Throttles write endpoints. Returns a 429 response to return as-is, or null
 * when the caller is within budget.
 *
 * This lives in the route handlers rather than in proxy.ts: proxy can be run
 * detached from the app, so a counter held in its module scope would not be
 * the same counter the app sees.
 *
 * Note for local testing: `next dev` re-evaluates route modules on recompile,
 * which resets these counters. Only a production build gives a true reading.
 */
export async function guardWrites(limit = 300, windowMs = 60_000) {
  const gate = rateLimit(`api:${clientIp(await headers())}`, limit, windowMs)
  if (gate.ok) return null
  return NextResponse.json(
    { error: 'Too many requests. Slow down a moment.' },
    { status: 429, headers: { 'retry-after': String(gate.retryAfter) } },
  )
}
