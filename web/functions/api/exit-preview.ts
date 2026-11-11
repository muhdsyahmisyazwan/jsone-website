import {
  PREVIEW_COOKIE,
  PREVIEW_UI_COOKIE,
  SANITY_PERSPECTIVE_COOKIE,
} from '../lib/constants'
import type {Env} from '../types'

/**
 * Clear preview cookies and redirect home (or ?redirect=).
 */
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url)
  const redirectParam = url.searchParams.get('redirect') || '/'
  const redirect =
    redirectParam.startsWith('/') && !redirectParam.startsWith('//') ? redirectParam : '/'

  const secure = url.protocol === 'https:' ? '; Secure' : ''
  const sameSite = url.protocol === 'https:' ? '; SameSite=None' : '; SameSite=Lax'
  const clearHttpOnly = `Path=/; HttpOnly; Max-Age=0${secure}${sameSite}`
  const clearUi = `Path=/; Max-Age=0${secure}${sameSite}`

  const headers = new Headers({
    Location: redirect,
    'Cache-Control': 'no-store',
  })
  headers.append('Set-Cookie', `${PREVIEW_COOKIE}=; ${clearHttpOnly}`)
  headers.append('Set-Cookie', `${SANITY_PERSPECTIVE_COOKIE}=; ${clearHttpOnly}`)
  headers.append('Set-Cookie', `${PREVIEW_UI_COOKIE}=; ${clearUi}`)

  return new Response(null, {status: 307, headers})
}
