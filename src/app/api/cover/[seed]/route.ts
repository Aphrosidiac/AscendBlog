/**
 * Deterministic abstract cover art, generated from the slug.
 * Keeps seeded stories looking like real posts without shipping any binary assets.
 */
function hash(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) }
  return h >>> 0
}

export async function GET(_req: Request, { params }: { params: Promise<{ seed: string }> }) {
  const { seed } = await params
  const h = hash(seed)
  // NB: >>> not >> — a signed shift goes negative once the top bit is set,
  // which indexes off the front of the palette array.
  const rnd = (n: number, i: number) => (h >>> (i * 3)) % n

  const palettes = [
    ['#1c1c1c', '#f2f2f2', '#8a8a8a'],
    ['#14312b', '#dfe9e4', '#6f9a8b'],
    ['#2a2136', '#ece7f2', '#8d7fa6'],
    ['#332018', '#f4ece5', '#a8836a'],
    ['#152436', '#e6eef5', '#6f90ad'],
    ['#2e1f1f', '#f3e9e9', '#a97b7b'],
  ]
  const [bg, fg, mid] = palettes[rnd(palettes.length, 1)]
  const variant = rnd(4, 3)

  const shapes =
    variant === 0
      ? `<g stroke="${mid}" stroke-width="10" fill="none">${Array.from({ length: 7 }, (_, i) =>
          `<path d="M${-40 + i * 90} 420 L${120 + i * 90} 60 L${280 + i * 90} 420"/>`).join('')}</g>`
      : variant === 1
        ? `<g fill="${mid}" opacity="0.85">${Array.from({ length: 5 }, (_, i) =>
            `<circle cx="${90 + i * 130}" cy="${140 + ((h >>> i) % 160)}" r="${30 + ((h >>> (i + 2)) % 55)}"/>`).join('')}</g>`
        : variant === 2
          ? `<g fill="${mid}">${Array.from({ length: 9 }, (_, i) =>
              `<rect x="${40 + i * 72}" y="${330 - ((h >>> i) % 250)}" width="42" height="${40 + ((h >>> i) % 250)}"/>`).join('')}</g>`
          : `<g stroke="${mid}" stroke-width="6" fill="none">${Array.from({ length: 11 }, (_, i) =>
              `<path d="M0 ${40 * i + 20} Q ${180 + ((h >>> i) % 200)} ${40 * i - 60}, 700 ${40 * i + 20}"/>`).join('')}</g>`

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 420" width="700" height="420">
<rect width="700" height="420" fill="${bg}"/>
${shapes}
<rect width="700" height="420" fill="${fg}" opacity="0.06"/>
</svg>`

  return new Response(svg, {
    headers: { 'content-type': 'image/svg+xml', 'cache-control': 'public, max-age=31536000, immutable' },
  })
}
