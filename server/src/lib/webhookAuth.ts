import {createHmac, timingSafeEqual} from 'node:crypto'

function safeEqualHexOrUtf8(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}

/**
 * Sanity `sanity-webhook-signature`: `t=<unix>,v1=<hex hmac>`
 * Payload signed: `${t}.${rawBody}` with HMAC-SHA256 hex digest.
 * @see https://www.sanity.io/docs/webhooks
 */
export function verifySanitySignature(
  rawBody: string,
  signatureHeader: string | undefined,
  secret: string,
  maxSkewSec = 300,
): boolean {
  if (!signatureHeader) return false

  const parts: Record<string, string> = {}
  for (const segment of signatureHeader.split(',')) {
    const idx = segment.indexOf('=')
    if (idx <= 0) continue
    parts[segment.slice(0, idx).trim()] = segment.slice(idx + 1).trim()
  }

  const t = parts.t
  const v1 = parts.v1
  if (!t || !v1) return false

  const ts = Number(t)
  if (!Number.isFinite(ts)) return false
  const nowSec = Math.floor(Date.now() / 1000)
  if (Math.abs(nowSec - ts) > maxSkewSec) return false

  const expectedHex = createHmac('sha256', secret).update(`${t}.${rawBody}`).digest('hex')
  if (safeEqualHexOrUtf8(expectedHex, v1)) return true

  // Some Sanity tooling historically used base64 digests - accept either.
  const expectedB64 = createHmac('sha256', secret).update(`${t}.${rawBody}`).digest('base64')
  return safeEqualHexOrUtf8(expectedB64, v1)
}

export type WebhookAuthResult =
  | {ok: true; via: 'bearer' | 'header' | 'signature'}
  | {ok: false; error: 'unauthorized' | 'secret_in_query_rejected'}

/**
 * Authorize Sanity webhook.
 * - Never trust `?secret=` (logs / Referer leak).
 * - Accept Bearer token, `x-sanity-webhook-secret`, or Sanity signature header.
 */
export function authorizeWebhook(input: {
  secret: string | undefined
  authorization: string | undefined
  headerSecret: string | undefined
  signatureHeader: string | undefined
  rawBody: string
  queryHasSecret: boolean
}): WebhookAuthResult {
  if (!input.secret) return {ok: false, error: 'unauthorized'}

  // Explicit migration signal when operators still use query secrets.
  if (input.queryHasSecret) {
    const headerOk =
      Boolean(input.headerSecret && safeEqualHexOrUtf8(input.headerSecret, input.secret)) ||
      Boolean(
        input.authorization?.startsWith('Bearer ') &&
          safeEqualHexOrUtf8(input.authorization.slice(7).trim(), input.secret),
      ) ||
      verifySanitySignature(input.rawBody, input.signatureHeader, input.secret)

    if (!headerOk) {
      return {ok: false, error: 'secret_in_query_rejected'}
    }
  }

  if (
    input.authorization?.startsWith('Bearer ') &&
    safeEqualHexOrUtf8(input.authorization.slice(7).trim(), input.secret)
  ) {
    return {ok: true, via: 'bearer'}
  }

  if (input.headerSecret && safeEqualHexOrUtf8(input.headerSecret, input.secret)) {
    return {ok: true, via: 'header'}
  }

  if (verifySanitySignature(input.rawBody, input.signatureHeader, input.secret)) {
    return {ok: true, via: 'signature'}
  }

  return {ok: false, error: 'unauthorized'}
}
