import type {Env} from '../types'

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {'Content-Type': 'application/json', 'Cache-Control': 'no-store'},
  })
}

/**
 * Sanity → Cloudflare Pages rebuild.
 *
 * Configure in Sanity Manage → API → Webhooks:
 *   URL: https://<your-domain>/api/sanity-webhook?secret=<SANITY_WEBHOOK_SECRET>
 *   Trigger: Create / Update / Delete on relevant types
 *   Projection: optional (we only need the ping)
 *
 * Set CF_DEPLOY_HOOK_URL to a Cloudflare Pages Deploy Hook
 * (Pages project → Settings → Builds & deployments → Deploy hooks).
 */
async function handle(context: EventContext<Env, any, Record<string, unknown>>): Promise<Response> {
  const {request, env} = context
  const url = new URL(request.url)

  const secret =
    url.searchParams.get('secret') ||
    request.headers.get('x-sanity-webhook-secret') ||
    ''

  if (!env.SANITY_WEBHOOK_SECRET || secret !== env.SANITY_WEBHOOK_SECRET) {
    return json({ok: false, error: 'unauthorized'}, 401)
  }

  if (!env.CF_DEPLOY_HOOK_URL) {
    console.error('[sanity-webhook] CF_DEPLOY_HOOK_URL not set')
    return json({ok: false, error: 'deploy_hook_missing'}, 500)
  }

  try {
    const deploy = await fetch(env.CF_DEPLOY_HOOK_URL, {method: 'POST'})
    if (!deploy.ok) {
      const body = await deploy.text()
      console.error('[sanity-webhook] deploy hook failed', deploy.status, body)
      return json({ok: false, error: 'deploy_hook_failed', status: deploy.status}, 502)
    }

    return json({ok: true, triggered: true})
  } catch (error) {
    console.error('[sanity-webhook]', error)
    return json({ok: false, error: 'server_error'}, 500)
  }
}

export const onRequestPost: PagesFunction<Env> = handle
export const onRequestGet: PagesFunction<Env> = handle
