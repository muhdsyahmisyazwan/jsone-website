import type {Context} from 'hono'

/**
 * Client IP behind Nginx.
 * Prefer X-Real-IP (set by our nginx sample). Only trust X-Forwarded-For when
 * TRUST_PROXY=true and Node is not directly public (bind HOST=127.0.0.1).
 */
export function getClientIp(
  c: Context,
  options: {trustProxy: boolean},
): string | undefined {
  const realIp = c.req.header('x-real-ip')?.trim()
  if (realIp) return realIp

  if (options.trustProxy) {
    const forwarded = c.req.header('x-forwarded-for')?.split(',')[0]?.trim()
    if (forwarded) return forwarded
  }

  const cf = c.req.header('cf-connecting-ip')?.trim()
  if (cf) return cf

  return undefined
}
