/** Default CSP: allows Astro inline boot scripts, Turnstile, Sanity images, optional analytics. */
export const DEFAULT_CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://static.cloudflareinsights.com https://plausible.io",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://cdn.sanity.io",
  "font-src 'self' data:",
  "connect-src 'self' https://cdn.sanity.io https://*.api.sanity.io https://challenges.cloudflare.com https://plausible.io https://cloudflareinsights.com",
  'frame-src https://challenges.cloudflare.com',
  // Presentation embeds the site in Studio
  "frame-ancestors 'self' https://www.sanity.io https://*.sanity.studio http://localhost:3333",
].join('; ')

export function applySecurityHeaders(
  setHeader: (name: string, value: string) => void,
  options: {
    contentSecurityPolicy?: string
    /** Set HSTS only when the request is known HTTPS (or behind TLS-terminating proxy). */
    enableHsts?: boolean
  } = {},
): void {
  setHeader('X-Content-Type-Options', 'nosniff')
  setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  setHeader('X-DNS-Prefetch-Control', 'off')
  setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()')

  let csp = options.contentSecurityPolicy || DEFAULT_CONTENT_SECURITY_POLICY
  if (options.enableHsts && !csp.includes('upgrade-insecure-requests')) {
    csp = `${csp}; upgrade-insecure-requests`
  }
  setHeader('Content-Security-Policy', csp)
  // Prefer CSP frame-ancestors; omit X-Frame-Options so Studio Presentation can embed.

  if (options.enableHsts) {
    setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }
}
