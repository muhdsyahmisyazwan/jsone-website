import {createClient} from '@sanity/client'
import {Hono} from 'hono'
import type {AppEnv} from '../env.js'
import {hasPreviewCookie} from '../lib/cookies.js'
import {
  draftHomePageQuery,
  draftNewsBySlugQuery,
  draftPageBySlugQuery,
  resolveDraftRoute,
} from '../lib/draftQueries.js'

type Variables = {env: AppEnv}

export const draftRoutes = new Hono<{Variables: Variables}>()

function summarizeDocument(doc: Record<string, unknown> | null) {
  if (!doc) return null
  const sections = Array.isArray(doc.sections) ? doc.sections : []
  const firstHero = sections.find(
    (s) =>
      s &&
      typeof s === 'object' &&
      ('_type' in s) &&
      (s._type === 'hero' || s._type === 'homeHero'),
  ) as Record<string, unknown> | undefined

  let heroHeading: unknown = firstHero?.heading
  if (heroHeading && typeof heroHeading === 'object') {
    const loc = heroHeading as {en?: {value?: string}}
    heroHeading = loc.en?.value
  }

  return {
    id: doc._id,
    title: doc.title,
    reviewed: doc.reviewed,
    updatedAt: doc._updatedAt,
    sectionCount: sections.length,
    sectionTypes: sections
      .map((s) => (s && typeof s === 'object' && '_type' in s ? String(s._type) : null))
      .filter(Boolean),
    heroHeading: typeof heroHeading === 'string' ? heroHeading : null,
    slug: doc.slug,
    language: doc.language,
  }
}

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

  const pathParam = url.searchParams.get('path')
  const typeParam = url.searchParams.get('type')
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
    let type = typeParam || 'page'
    let params: Record<string, string> = {locale, slug}
    let query: string

    if (pathParam) {
      const route = resolveDraftRoute(pathParam)
      if (route.type === 'unknown') {
        return c.json({ok: true, document: null, summary: null, route, perspective: 'previewDrafts'})
      }
      if (route.type === 'homePage') {
        type = 'homePage'
        query = draftHomePageQuery
        params = {}
      } else if (route.type === 'news') {
        type = 'news'
        query = draftNewsBySlugQuery
        params = {locale: route.locale, slug: route.slug}
      } else {
        type = 'page'
        query = draftPageBySlugQuery
        params = {locale: route.locale, slug: route.slug}
      }

      const document = await client.fetch(query, params)
      return c.json({
        ok: true,
        type,
        route,
        document,
        summary: summarizeDocument(document),
        perspective: 'previewDrafts',
        note: 'Static HTML is last build; summary/document are live drafts from Sanity.',
      })
    }

    switch (type) {
      case 'homePage':
        query = draftHomePageQuery
        params = {}
        break
      case 'siteSettings':
        query = `*[_type == "siteSettings" && _id == "siteSettings"][0]`
        params = {}
        break
      case 'navigation':
        query = `*[_type == "navigation" && _id == "navigation"][0]`
        params = {}
        break
      case 'news':
        query = draftNewsBySlugQuery
        break
      case 'page':
      default:
        query = draftPageBySlugQuery
        break
    }

    const document = await client.fetch(query, params)
    return c.json({
      ok: true,
      type,
      document,
      summary: summarizeDocument(document),
      perspective: 'previewDrafts',
      note: 'Static HTML is last build; summary/document are live drafts from Sanity.',
    })
  } catch (error) {
    console.error('[draft]', error)
    return c.json({ok: false, error: 'fetch_failed'}, 500)
  }
})
