import {createClient} from '@sanity/client'
import {Hono} from 'hono'
import type {AppEnv} from '../env.js'
import {hasPreviewCookie} from '../lib/cookies.js'

type Variables = {env: AppEnv}

export const draftRoutes = new Hono<{Variables: Variables}>()

draftRoutes.get('/draft', async (c) => {
  const env = c.get('env')
  const url = new URL(c.req.url)
  const secret = url.searchParams.get('secret') || ''
  const allowed =
    hasPreviewCookie(c.req.header('cookie')) ||
    Boolean(env.SANITY_PREVIEW_SECRET && secret === env.SANITY_PREVIEW_SECRET)

  if (!allowed) return c.json({ok: false, error: 'preview_required'}, 401)

  const projectId = env.PUBLIC_SANITY_PROJECT_ID
  const token = env.SANITY_API_READ_TOKEN
  if (!projectId || !token) {
    return c.json({ok: false, error: 'sanity_not_configured'}, 500)
  }

  const type = url.searchParams.get('type') || 'page'
  const slug = url.searchParams.get('slug') || ''
  const locale = url.searchParams.get('locale') || 'en'

  const client = createClient({
    projectId,
    dataset: env.PUBLIC_SANITY_DATASET,
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
    return c.json({ok: true, document, perspective: 'previewDrafts'})
  } catch (error) {
    console.error('[draft]', error)
    return c.json({ok: false, error: 'fetch_failed'}, 500)
  }
})
