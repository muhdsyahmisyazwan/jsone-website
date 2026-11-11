import {createClient} from '@sanity/client'
import {PREVIEW_COOKIE} from '../lib/constants'
import type {Env} from '../types'

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  })
}

function hasPreviewCookie(request: Request): boolean {
  const cookie = request.headers.get('Cookie') || ''
  return cookie.split(';').some((c) => c.trim().startsWith(`${PREVIEW_COOKIE}=1`))
}

/**
 * Fetch draft Sanity documents for Presentation / preview banner.
 * Requires preview cookie (from /api/preview) and SANITY_API_READ_TOKEN.
 *
 * GET /api/draft?type=page&slug=about&locale=en
 * GET /api/draft?type=homePage
 * GET /api/draft?type=news&slug=my-post&locale=ms
 */
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const {request, env} = context
  const url = new URL(request.url)

  const secret = url.searchParams.get('secret') || ''
  const allowed =
    hasPreviewCookie(request) ||
    (env.SANITY_PREVIEW_SECRET && secret === env.SANITY_PREVIEW_SECRET)

  if (!allowed) {
    return json({ok: false, error: 'preview_required'}, 401)
  }

  const projectId = env.PUBLIC_SANITY_PROJECT_ID
  const dataset = env.PUBLIC_SANITY_DATASET || 'production'
  const token = env.SANITY_API_READ_TOKEN

  if (!projectId || !token) {
    return json({ok: false, error: 'sanity_not_configured'}, 500)
  }

  const type = url.searchParams.get('type') || 'page'
  const slug = url.searchParams.get('slug') || ''
  const locale = url.searchParams.get('locale') || 'en'

  const client = createClient({
    projectId,
    dataset,
    apiVersion: '2025-01-01',
    useCdn: false,
    token,
    perspective: 'previewDrafts',
  })

  try {
    let query: string
    let params: Record<string, string> = {}

    switch (type) {
      case 'homePage':
        query = `*[_type == "homePage" && _id == "homePage"][0]`
        break
      case 'siteSettings':
        query = `*[_type == "siteSettings" && _id == "siteSettings"][0]`
        break
      case 'navigation':
        query = `*[_type == "navigation" && _id == "navigation"][0]`
        break
      case 'news':
        query = `*[_type == "news" && language == $locale && slug.current == $slug][0]`
        params = {locale, slug}
        break
      case 'page':
      default:
        query = `*[_type == "page" && language == $locale && slug.current == $slug][0]`
        params = {locale, slug}
        break
    }

    const document = await client.fetch(query, params)
    return json({ok: true, document, perspective: 'previewDrafts'})
  } catch (error) {
    console.error('[draft]', error)
    return json({ok: false, error: 'fetch_failed'}, 500)
  }
}
