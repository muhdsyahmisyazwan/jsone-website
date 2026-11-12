import {existsSync} from 'node:fs'
import {readFile} from 'node:fs/promises'
import path from 'node:path'
import {serve} from '@hono/node-server'
import {serveStatic} from '@hono/node-server/serve-static'
import {Hono} from 'hono'
import {loadEnv, type AppEnv} from './env.js'
import {getRebuildStatus} from './lib/rebuild.js'
import {applySecurityHeaders} from './lib/securityHeaders.js'
import {contactRoutes} from './routes/contact.js'
import {draftRoutes} from './routes/draft.js'
import {previewRoutes} from './routes/preview.js'
import {webhookRoutes} from './routes/webhook.js'

type Variables = {env: AppEnv}

const env = loadEnv()

const app = new Hono<{Variables: Variables}>()

app.use('*', async (c, next) => {
  c.set('env', env)

  const forwardedProto = c.req.header('x-forwarded-proto')?.split(',')[0]?.trim()
  const isHttps =
    forwardedProto === 'https' ||
    env.SITE_ORIGIN.startsWith('https://')

  applySecurityHeaders((name, value) => c.header(name, value), {
    contentSecurityPolicy: env.CONTENT_SECURITY_POLICY,
    enableHsts: env.isProduction && isHttps,
  })

  await next()
})

function applyStudioCors(c: {req: {header: (n: string) => string | undefined}; header: (n: string, v: string) => void}) {
  const origin = c.req.header('origin')
  if (!origin) return
  let host = ''
  try {
    host = new URL(origin).hostname
  } catch {
    return
  }
  const siteHost = (() => {
    try {
      return new URL(env.SITE_ORIGIN).hostname
    } catch {
      return ''
    }
  })()
  const allowed =
    origin === env.SITE_ORIGIN ||
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === siteHost ||
    host.endsWith('.sanity.studio') ||
    host === 'www.sanity.io'

  if (!allowed) return
  c.header('Access-Control-Allow-Origin', origin)
  c.header('Vary', 'Origin')
}

app.options('/api/health', (c) => {
  applyStudioCors(c)
  c.header('Access-Control-Allow-Methods', 'GET, OPTIONS')
  c.header('Access-Control-Allow-Headers', 'Content-Type')
  c.header('Access-Control-Max-Age', '86400')
  return c.body(null, 204)
})

app.get('/api/health', (c) => {
  applyStudioCors(c)
  const rebuild = getRebuildStatus({
    command: env.REBUILD_COMMAND,
    debounceMs: env.REBUILD_DEBOUNCE_MS,
    logPath: env.REBUILD_LOG_PATH,
  })

  return c.json({
    ok: true,
    env: env.NODE_ENV,
    staticDir: env.STATIC_DIR,
    staticReady: existsSync(env.STATIC_DIR),
    contact: {
      turnstileConfigured: Boolean(env.TURNSTILE_SECRET_KEY),
      turnstileSkip: env.TURNSTILE_SKIP === 'true',
      resendConfigured: Boolean(env.RESEND_API_KEY),
      /** Production must have Turnstile + Resend (skip forbidden). */
      readyForProduction:
        env.TURNSTILE_SKIP !== 'true' &&
        Boolean(env.TURNSTILE_SECRET_KEY) &&
        Boolean(env.RESEND_API_KEY),
    },
    webhook: {
      secretConfigured: Boolean(env.SANITY_WEBHOOK_SECRET),
      deployHookConfigured: Boolean(env.CF_DEPLOY_HOOK_URL),
    },
    rebuild,
  })
})

app.route('/api', contactRoutes)
app.route('/api', previewRoutes)
app.route('/api', draftRoutes)
app.route('/api', webhookRoutes)

const staticReady = existsSync(env.STATIC_DIR)
if (!staticReady) {
  console.warn(
    `[server] Static dir missing: ${env.STATIC_DIR}\n` +
      `         Run "npm run build -w web" from the repo root, then restart.`,
  )
} else {
  console.log(`[server] Static files: ${env.STATIC_DIR}`)

  // serveStatic root is relative to process.cwd() - pass relative path when possible
  const rootRel = path.relative(process.cwd(), env.STATIC_DIR) || '.'
  app.use(
    '/*',
    serveStatic({
      root: rootRel,
      onFound: (_path, c) => {
        if (_path.includes(`${path.sep}_astro${path.sep}`) || _path.includes('/_astro/')) {
          c.header('Cache-Control', 'public, max-age=31536000, immutable')
        } else if (
          _path.endsWith('.html') ||
          _path.endsWith(`${path.sep}index.html`) ||
          _path.endsWith('/index.html')
        ) {
          c.header('Cache-Control', 'public, max-age=0, must-revalidate')
        }
      },
    }),
  )
}

app.notFound(async (c) => {
  if (c.req.path.startsWith('/api/')) {
    return c.json({ok: false, error: 'not_found'}, 404)
  }

  const pathname = c.req.path
  const candidates = [
    path.join(env.STATIC_DIR, pathname, 'index.html'),
    path.join(env.STATIC_DIR, `${pathname.replace(/\/$/, '')}.html`),
    path.join(env.STATIC_DIR, '404.html'),
  ]

  for (const file of candidates) {
    if (!existsSync(file)) continue
    const html = await readFile(file, 'utf8')
    const is404 = file.endsWith(`${path.sep}404.html`) || file.endsWith('/404.html')
    c.header('Cache-Control', 'public, max-age=0, must-revalidate')
    return c.html(html, is404 ? 404 : 200)
  }

  return c.text('Not Found', 404)
})

if (env.isProduction) {
  if (env.TURNSTILE_SKIP === 'true') {
    console.error('[server] WARNING: TURNSTILE_SKIP=true in production — contact will fail closed')
  }
  if (!env.TURNSTILE_SECRET_KEY || !env.RESEND_API_KEY) {
    console.error(
      '[server] WARNING: production contact requires TURNSTILE_SECRET_KEY and RESEND_API_KEY',
    )
  }
  if (env.HOST !== '127.0.0.1' && env.HOST !== 'localhost') {
    console.warn(
      `[server] HOST=${env.HOST} — prefer 127.0.0.1 behind Nginx so client IPs stay trusted`,
    )
  }
}

serve({fetch: app.fetch, hostname: env.HOST, port: env.PORT}, (info) => {
  const host = info.address === '::' || info.address === '0.0.0.0' ? 'localhost' : info.address
  console.log(`[server] listening on http://${host}:${info.port} (${env.NODE_ENV})`)
  console.log(`[server] health     http://${host}:${info.port}/api/health`)
})
