import sanitizeHtml from 'sanitize-html'

/**
 * The allowlist mirrors what the TipTap schema can actually produce. Anything
 * else a client sends — script tags, event handlers, iframes, javascript: URLs
 * — is dropped rather than escaped, so stored HTML is safe to hand to
 * dangerouslySetInnerHTML.
 *
 * The editor constrains a normal author, but the editor is not the security
 * boundary: PATCH /api/posts/[id] accepts whatever a client sends, so the
 * sanitising has to happen on the server, on write.
 */
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'p', 'br', 'hr',
    'h1', 'h2', 'h3', 'h4',
    'strong', 'b', 'em', 'i', 's', 'u', 'mark', 'sub', 'sup',
    'a', 'code', 'pre', 'blockquote',
    'ul', 'ol', 'li',
    'img', 'figure', 'figcaption',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
  ],
  allowedAttributes: {
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height'],
    // The editor emits these for task lists and alignment; nothing else.
    '*': ['class'],
  },
  // Only these can appear in href/src. `data:` is absent on purpose: a
  // data: URL is a same-origin document and can carry script.
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedSchemesAppliedToAttributes: ['href', 'src'],
  allowProtocolRelative: false,
  // Drop the contents of anything disallowed rather than leaving stray text.
  nonTextTags: ['style', 'script', 'textarea', 'option', 'noscript', 'iframe', 'object', 'embed'],
  transformTags: {
    // Anything leaving the site opens detached from it.
    a: (tagName, attribs) => {
      const href = attribs.href ?? ''
      const external = /^https?:\/\//i.test(href)
      return {
        tagName,
        attribs: external
          ? { ...attribs, target: '_blank', rel: 'noopener noreferrer nofollow' }
          : attribs,
      }
    },
  },
  // `class` is allowed above so editor styling survives; keep it to a known set
  // so a caller can't smuggle in utility classes that reposition page chrome.
  allowedClasses: {
    '*': ['hl', 'story-*', 'text-*', 'is-*', 'language-*'],
  },
}

/** Sanitises story/response body HTML. Safe to call on already-clean input. */
export function sanitizeStoryHtml(html: string): string {
  return sanitizeHtml(html, OPTIONS)
}
