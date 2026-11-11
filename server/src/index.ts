import {existsSync} from 'node:fs'
import {readFile} from 'node:fs/promises'
import path from 'node:path'
import {serve} from '@hono/node-server'
import {serveStatic} from '@hono/node-server/serve-static'
import {Hono} from 'hono'
import {loadEnv, type AppEnv} from './env.js'
import {contactRoutes} from './routes/contact.js'
import {draftRoutes} from './routes/draft.js'
import {previewRoutes} from './routes/preview.js'
import {webhookRoutes} from './routes/webhook.js'

type Variables = {env: AppEnv}

const env = loadEnv()

const app = new Hono<{Variables: Variables}>()

app.use('*', async (c, next) => {
  c.set('env', env)
  c.header('X-Content-Type-Options', 'nosniff')
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin')
  await next()
})

app.get('/api/health', (c) =>
  c.json({
    ok: true,
    staticDir: env.STATIC_DIR,
    staticReady: existsSync(env.STATIC_DIR),
  }),
)

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
    return c.html(html, is404 ? 404 : 200)
  }

  return c.text('Not Found', 404)
})

serve({fetch: app.fetch, hostname: env.HOST, port: env.PORT}, (info) => {
  const host = info.address === '::' || info.address === '0.0.0.0' ? 'localhost' : info.address
  console.log(`[server] listening on http://${host}:${info.port}`)
  console.log(`[server] health     http://${host}:${info.port}/api/health`)
})
