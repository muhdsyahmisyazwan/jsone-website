import {spawn} from 'node:child_process'
import type {Context} from 'hono'
import {Hono} from 'hono'
import type {AppEnv} from '../env.js'

type Variables = {env: AppEnv}

function triggerRebuild(command: string): void {
  const child = spawn(command, {
    shell: true,
    detached: true,
    stdio: 'ignore',
    env: process.env,
  })
  child.unref()
  console.log('[sanity-webhook] rebuild started:', command)
}

export const webhookRoutes = new Hono<{Variables: Variables}>()

async function handleWebhook(c: Context<{Variables: Variables}>) {
  const env = c.get('env')
  const url = new URL(c.req.url)
  const secret =
    url.searchParams.get('secret') || c.req.header('x-sanity-webhook-secret') || ''

  if (!env.SANITY_WEBHOOK_SECRET || secret !== env.SANITY_WEBHOOK_SECRET) {
    return c.json({ok: false, error: 'unauthorized'}, 401)
  }

  const results: {rebuild?: boolean; deployHook?: boolean} = {}

  if (env.REBUILD_COMMAND) {
    try {
      triggerRebuild(env.REBUILD_COMMAND)
      results.rebuild = true
    } catch (error) {
      console.error('[sanity-webhook] rebuild spawn failed', error)
      return c.json({ok: false, error: 'rebuild_failed'}, 500)
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

  if (!results.rebuild && !results.deployHook) {
    console.error('[sanity-webhook] set REBUILD_COMMAND and/or CF_DEPLOY_HOOK_URL')
    return c.json({ok: false, error: 'no_rebuild_configured'}, 500)
  }

  return c.json({ok: true, triggered: true, ...results})
}

webhookRoutes.get('/sanity-webhook', handleWebhook)
webhookRoutes.post('/sanity-webhook', handleWebhook)
