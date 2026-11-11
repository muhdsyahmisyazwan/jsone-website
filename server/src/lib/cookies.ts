import type {Context} from 'hono'
import {
  COOKIE_MAX_AGE,
  PREVIEW_COOKIE,
  PREVIEW_UI_COOKIE,
  SANITY_PERSPECTIVE_COOKIE,
} from '../constants.js'

function isSecure(c: Context): boolean {
  const proto = c.req.header('x-forwarded-proto') || new URL(c.req.url).protocol.replace(':', '')
  return proto === 'https'
}

function isPartitioned(c: Context): boolean {
  return (
    c.req.header('sec-fetch-dest') === 'iframe' &&
    c.req.header('sec-fetch-site') === 'cross-site'
  )
}

export function setPreviewCookies(c: Context, perspective: string): void {
  const secure = isSecure(c)
  const partitioned = isPartitioned(c)
  const base = [
    'Path=/',
    'HttpOnly',
    secure ? 'Secure' : '',
    secure ? 'SameSite=None' : 'SameSite=Lax',
    `Max-Age=${COOKIE_MAX_AGE}`,
    partitioned ? 'Partitioned' : '',
  ]
    .filter(Boolean)
    .join('; ')

  c.header('Set-Cookie', `${PREVIEW_COOKIE}=1; ${base}`, {append: true})
  c.header(
    'Set-Cookie',
    `${SANITY_PERSPECTIVE_COOKIE}=${encodeURIComponent(perspective)}; ${base}`,
    {append: true},
  )
  const ui = [
    `${PREVIEW_UI_COOKIE}=1`,
    'Path=/',
    secure ? 'Secure' : '',
    secure ? 'SameSite=None' : 'SameSite=Lax',
    `Max-Age=${COOKIE_MAX_AGE}`,
    partitioned ? 'Partitioned' : '',
  ]
    .filter(Boolean)
    .join('; ')
  c.header('Set-Cookie', ui, {append: true})
}

export function clearPreviewCookies(c: Context): void {
  const secure = isSecure(c)
  const sameSite = secure ? 'SameSite=None' : 'SameSite=Lax'
  const secureFlag = secure ? 'Secure' : ''
  const clearHttpOnly = ['Path=/', 'HttpOnly', 'Max-Age=0', sameSite, secureFlag]
    .filter(Boolean)
    .join('; ')
  const clearUi = ['Path=/', 'Max-Age=0', sameSite, secureFlag].filter(Boolean).join('; ')

  c.header('Set-Cookie', `${PREVIEW_COOKIE}=; ${clearHttpOnly}`, {append: true})
  c.header('Set-Cookie', `${SANITY_PERSPECTIVE_COOKIE}=; ${clearHttpOnly}`, {append: true})
  c.header('Set-Cookie', `${PREVIEW_UI_COOKIE}=; ${clearUi}`, {append: true})
}

export function hasPreviewCookie(cookieHeader: string | undefined): boolean {
  if (!cookieHeader) return false
  return cookieHeader.split(';').some((c) => c.trim().startsWith(`${PREVIEW_COOKIE}=1`))
}
