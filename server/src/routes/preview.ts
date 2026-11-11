import {createClient} from '@sanity/client'
import {validatePreviewUrl} from '@sanity/preview-url-secret'
import {withoutSecretSearchParams} from '@sanity/preview-url-secret/without-secret-search-params'
import {Hono} from 'hono'
import type {AppEnv} from '../env.js'
import {clearPreviewCookies, setPreviewCookies} from '../lib/cookies.js'

type Variables = {env: AppEnv}

export const previewRoutes = new Hono<{Variables: Variables}>()

previewRoutes.get('/preview', async (c) => {
  const env = c.get('env')
  const url = new URL(c.req.url)

  const manualSecret = url.searchParams.get('secret') || ''
  if (env.SANITY_PREVIEW_SECRET && manualSecret === env.SANITY_PREVIEW_SECRET) {
    const redirectParam = url.searchParams.get('redirect') || '/'
    const redirect =
      redirectParam.startsWith('/') && !redirectParam.startsWith('//') ? redirectParam : '/'
    setPreviewCookies(c, 'drafts')
    return c.redirect(redirect, 307)
  }

  const projectId = env.PUBLIC_SANITY_PROJECT_ID
  const token = env.SANITY_API_READ_TOKEN
  if (!projectId || !token) {
    return c.html(
      '<!doctype html><title>Misconfigured</title><p>Sanity preview is not configured.</p>',
      500,
    )
  }

  const client = createClient({
    projectId,
    dataset: env.PUBLIC_SANITY_DATASET,
    apiVersion: '2025-01-01',
    useCdn: false,
    token,
  })

  try {
    const {isValid, redirectTo, studioPreviewPerspective} = await validatePreviewUrl(
      client,
      c.req.url,
    )
    if (!isValid) {
      return c.html(
        '<!doctype html><title>Unauthorized</title><p>Invalid preview secret.</p>',
        401,
      )
    }

    const cleanRedirect = redirectTo
      ? withoutSecretSearchParams(new URL(redirectTo, c.req.url)).pathname +
        withoutSecretSearchParams(new URL(redirectTo, c.req.url)).search
      : '/'

    setPreviewCookies(c, studioPreviewPerspective || 'drafts')
    return c.redirect(cleanRedirect || '/', 307)
  } catch (error) {
    console.error('[preview]', error)
    return c.html('<!doctype html><title>Error</title><p>Preview enable failed.</p>', 500)
  }
})

previewRoutes.get('/exit-preview', (c) => {
  const redirectParam = new URL(c.req.url).searchParams.get('redirect') || '/'
  const redirect =
    redirectParam.startsWith('/') && !redirectParam.startsWith('//') ? redirectParam : '/'
  clearPreviewCookies(c)
  return c.redirect(redirect, 307)
})
