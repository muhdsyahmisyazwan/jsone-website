import {createClient} from '@sanity/client'
import {validatePreviewUrl} from '@sanity/preview-url-secret'
import {withoutSecretSearchParams} from '@sanity/preview-url-secret/without-secret-search-params'
import {
  PREVIEW_COOKIE,
  PREVIEW_UI_COOKIE,
  SANITY_PERSPECTIVE_COOKIE,
} from '../lib/constants'
import type {Env} from '../types'

const COOKIE_MAX_AGE = 60 * 60 // 1 hour (matches Sanity session secrets)

function html(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: {'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store'},
  })
}

function setPreviewCookies(
  headers: Headers,
  request: Request,
  perspective: string,
): void {
  const url = new URL(request.url)
  const secure = url.protocol === 'https:'
  const partitioned =
    request.headers.get('sec-fetch-dest') === 'iframe' &&
    request.headers.get('sec-fetch-site') === 'cross-site'

  const base = [
    'Path=/',
    'HttpOnly',
    secure ? 'Secure' : '',
    // SameSite=None required for Studio iframe on another origin
    secure ? 'SameSite=None' : 'SameSite=Lax',
    `Max-Age=${COOKIE_MAX_AGE}`,
    partitioned ? 'Partitioned' : '',
  ]
    .filter(Boolean)
    .join('; ')

  headers.append('Set-Cookie', `${PREVIEW_COOKIE}=1; ${base}`)
  headers.append(
    'Set-Cookie',
    `${SANITY_PERSPECTIVE_COOKIE}=${encodeURIComponent(perspective)}; ${base}`,
  )
  // Non-HttpOnly so the static site can show a preview banner
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
  headers.append('Set-Cookie', ui)
}

/**
 * Enable draft preview mode for Sanity Presentation Tool.
 *
 * Also accepts a legacy manual link:
 *   /api/preview?secret=<SANITY_PREVIEW_SECRET>&redirect=/about/
 */
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const {request, env} = context
  const url = new URL(request.url)

  // Manual shared-secret fallback (non-Presentation links)
  const manualSecret = url.searchParams.get('secret') || ''
  if (
    env.SANITY_PREVIEW_SECRET &&
    manualSecret &&
    manualSecret === env.SANITY_PREVIEW_SECRET
  ) {
    const redirectParam = url.searchParams.get('redirect') || '/'
    const redirect =
      redirectParam.startsWith('/') && !redirectParam.startsWith('//')
        ? redirectParam
        : '/'
    const headers = new Headers({Location: redirect, 'Cache-Control': 'no-store'})
    setPreviewCookies(headers, request, 'drafts')
    return new Response(null, {status: 307, headers})
  }

  const projectId = env.PUBLIC_SANITY_PROJECT_ID
  const dataset = env.PUBLIC_SANITY_DATASET || 'production'
  const token = env.SANITY_API_READ_TOKEN

  if (!projectId || !token) {
    return html(
      '<!doctype html><title>Misconfigured</title><p>Sanity preview is not configured.</p>',
      500,
    )
  }

  const client = createClient({
    projectId,
    dataset,
    apiVersion: '2025-01-01',
    useCdn: false,
    token,
  })

  try {
    const {isValid, redirectTo, studioPreviewPerspective} = await validatePreviewUrl(
      client,
      request.url,
    )

    if (!isValid) {
      return html('<!doctype html><title>Unauthorized</title><p>Invalid preview secret.</p>', 401)
    }

    const cleanRedirect = redirectTo
      ? withoutSecretSearchParams(new URL(redirectTo, request.url)).pathname +
        withoutSecretSearchParams(new URL(redirectTo, request.url)).search
      : '/'

    const headers = new Headers({
      Location: cleanRedirect || '/',
      'Cache-Control': 'no-store',
    })
    setPreviewCookies(headers, request, studioPreviewPerspective || 'drafts')
    return new Response(null, {status: 307, headers})
  } catch (error) {
    console.error('[preview]', error)
    return html('<!doctype html><title>Error</title><p>Preview enable failed.</p>', 500)
  }
}
