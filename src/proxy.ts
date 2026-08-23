import { NextResponse, type NextRequest } from 'next/server'

/**
 * Per-request nonce CSP, on the `proxy` convention (Next 16 renamed
 * `middleware`). It stays stateless on purpose — proxy can run detached from
 * the app, so throttling counters live in the route handlers instead.
 *
 * Next reads the policy off the request headers and
 * stamps the same nonce onto the scripts it emits, so 'strict-dynamic' can
 * cover the chunks those scripts pull in without listing every one.
 *
 * `unsafe-eval` is dev-only — React Refresh needs it and the production bundle
 * does not.
 */
export function proxy(req: NextRequest) {
  const nonce = btoa(crypto.randomUUID())
  const dev = process.env.NODE_ENV !== 'production'

  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ''}`,
    // Inline style attributes (style={{…}}) are style-src, not style-src-attr.
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' blob: data: https:`,
    `font-src 'self'`,
    `connect-src 'self'`,
    `object-src 'none'`,
    `base-uri 'none'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    ...(dev ? [] : [`upgrade-insecure-requests`]),
  ].join('; ')

  const headers = new Headers(req.headers)
  headers.set('x-nonce', nonce)
  headers.set('content-security-policy', csp)

  const res = NextResponse.next({ request: { headers } })
  res.headers.set('content-security-policy', csp)
  return res
}

export const config = {
  matcher: [
    // Everything except static assets and the favicon.
    { source: '/((?!_next/static|_next/image|favicon.ico|uploads).*)', missing: [{ type: 'header', key: 'next-router-prefetch' }] },
  ],
}
