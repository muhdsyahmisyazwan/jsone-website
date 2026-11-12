import type {Context} from 'hono'
import {Hono} from 'hono'
import type {AppEnv} from '../env.js'
import {getClientIp} from '../lib/clientIp.js'
import {rateLimit} from '../lib/rateLimit.js'
import {getRebuildStatus, triggerRebuild} from '../lib/rebuild.js'
import {authorizeWebhook} from '../lib/webhookAuth.js'

type Variables = {env: AppEnv}

export const webhookRoutes = new Hono<{Variables: Variables}>()

async function handleWebhook(c: Context<{Variables: Variables}>) {
  const env = c.get('env')
  const url = new URL(c.req.url)
  const queryHasSecret = url.searchParams.has('secret')

  const ip = getClientIp(c, {trustProxy: env.TRUST_PROXY}) || 'unknown'
  const limited = rateLimit(
    `webhook:${ip}`,
    env.WEBHOOK_RATE_LIMIT,
    env.WEBHOOK_RATE_WINDOW_MS,
  )
  if (!limited.ok) {
    c.header('Retry-After', String(limited.retryAfterSec))
    return c.json({ok: false, error: 'rate_limited'}, 429)
  }

  const rawBody = c.req.method === 'GET' ? '' : await c.req.text()

  const auth = authorizeWebhook({
    secret: env.SANITY_WEBHOOK_SECRET,
    authorization: c.req.header('authorization'),
    headerSecret: c.req.header('x-sanity-webhook-secret') || undefined,
    signatureHeader: c.req.header('sanity-webhook-signature') || undefined,
    rawBody,
    queryHasSecret,
  })

  if (!auth.ok) {
    if (auth.error === 'secret_in_query_rejected') {
      return c.json(
        {
          ok: false,
          error: 'secret_in_query_rejected',
          hint: 'Pass the secret via header x-sanity-webhook-secret, Authorization: Bearer, or Sanity signature - not ?secret=',
        },
        401,
      )
    }
    return c.json({ok: false, error: 'unauthorized'}, 401)
  }

  const results: {
    rebuild?: boolean
    rebuildSkipped?: string
    deployHook?: boolean
    authVia?: string
  } = {authVia: auth.via}

  if (env.REBUILD_COMMAND) {
    const rebuild = triggerRebuild({
      command: env.REBUILD_COMMAND,
      debounceMs: env.REBUILD_DEBOUNCE_MS,
      lockPath: env.REBUILD_LOCK_PATH,
    })
    if (!rebuild.ok) {
      return c.json({ok: false, error: 'rebuild_failed', detail: rebuild.error}, 500)
    }
    if (rebuild.started) {
      results.rebuild = true
    } else {
      results.rebuildSkipped = rebuild.reason
    }
  }

  if (env.CF_DEPLOY_HOOK_URL) {
    try {
      const deploy = await fetch(env.CF_DEPLOY_HOOK_URL, {method: 'POST'})
      if (!deploy.ok) {
        const body = await deploy.text()
        console.error('[sanity-webhook] deploy hook failed', deploy.status, body)
        return c.json({ok: false, error: 'deploy_hook_failed', status: deploy.status}, 502)
      }
      results.deployHook = true
    } catch (error) {
      console.error('[sanity-webhook]', error)
      return c.json({ok: false, error: 'server_error'}, 500)
    }
  }

  if (!results.rebuild && !results.rebuildSkipped && !results.deployHook) {
    console.error('[sanity-webhook] set REBUILD_COMMAND (optional emergency: CF_DEPLOY_HOOK_URL)')
    return c.json({ok: false, error: 'no_rebuild_configured'}, 500)
  }

  return c.json({
    ok: true,
    triggered: Boolean(results.rebuild || results.deployHook),
    ...results,
    rebuildStatus: getRebuildStatus({
      command: env.REBUILD_COMMAND,
      debounceMs: env.REBUILD_DEBOUNCE_MS,
      logPath: env.REBUILD_LOG_PATH,
    }),
  })
}

webhookRoutes.get('/sanity-webhook', handleWebhook)
webhookRoutes.post('/sanity-webhook', handleWebhook)
