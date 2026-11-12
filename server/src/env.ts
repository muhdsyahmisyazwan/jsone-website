import {existsSync, readFileSync} from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const repoWebEnv = path.resolve(serverRoot, '../web/.env')
const defaultStaticDir = path.resolve(serverRoot, '../web/dist')

/** Load KEY=VALUE lines into process.env if the file exists (never fail if missing). */
function loadEnvFile(filePath: string) {
  if (!existsSync(filePath)) return
  const text = readFileSync(filePath, 'utf8')
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq <= 0) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (process.env[key] === undefined) {
      process.env[key] = value
    }
  }
}

function intEnv(name: string, fallback: number): number {
  const raw = process.env[name]
  if (raw === undefined || raw === '') return fallback
  const n = Number(raw)
  return Number.isFinite(n) && n > 0 ? n : fallback
}

export type AppEnv = {
  NODE_ENV: string
  isProduction: boolean
  PORT: number
  HOST: string
  STATIC_DIR: string
  SITE_ORIGIN: string
  TRUST_PROXY: boolean

  PUBLIC_SANITY_PROJECT_ID?: string
  PUBLIC_SANITY_DATASET: string
  SANITY_API_READ_TOKEN?: string

  TURNSTILE_SECRET_KEY?: string
  TURNSTILE_SKIP?: string
  CONTACT_TO_EMAIL: string
  CONTACT_FROM_EMAIL: string
  RESEND_API_KEY?: string

  SANITY_WEBHOOK_SECRET?: string
  CF_DEPLOY_HOOK_URL?: string
  REBUILD_COMMAND?: string
  REBUILD_DEBOUNCE_MS: number
  REBUILD_LOCK_PATH: string
  REBUILD_LOG_PATH: string

  CONTACT_RATE_LIMIT: number
  CONTACT_RATE_WINDOW_MS: number
  WEBHOOK_RATE_LIMIT: number
  WEBHOOK_RATE_WINDOW_MS: number

  CONTENT_SECURITY_POLICY?: string

  SANITY_PREVIEW_SECRET?: string
}

export function loadEnv(): AppEnv {
  const explicit = process.env.ENV_FILE
  if (explicit) loadEnvFile(path.resolve(explicit))
  else loadEnvFile(repoWebEnv)

  const port = Number(process.env.PORT || 4321)
  const staticDir = process.env.STATIC_DIR
    ? path.resolve(process.env.STATIC_DIR)
    : defaultStaticDir

  const nodeEnv = process.env.NODE_ENV || 'development'
  const isProduction = nodeEnv === 'production'

  return {
    NODE_ENV: nodeEnv,
    isProduction,
    PORT: Number.isFinite(port) ? port : 4321,
    HOST: process.env.HOST || '0.0.0.0',
    STATIC_DIR: staticDir,
    SITE_ORIGIN: process.env.SITE_ORIGIN || process.env.PUBLIC_SITE_URL || 'http://localhost:4321',
    TRUST_PROXY: process.env.TRUST_PROXY === 'true' || isProduction,

    PUBLIC_SANITY_PROJECT_ID: process.env.PUBLIC_SANITY_PROJECT_ID,
    PUBLIC_SANITY_DATASET: process.env.PUBLIC_SANITY_DATASET || 'production',
    SANITY_API_READ_TOKEN: process.env.SANITY_API_READ_TOKEN,

    TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
    TURNSTILE_SKIP: process.env.TURNSTILE_SKIP,
    CONTACT_TO_EMAIL: process.env.CONTACT_TO_EMAIL || 'info@jsone.com.my',
    CONTACT_FROM_EMAIL:
      process.env.CONTACT_FROM_EMAIL || 'JS One Website <onboarding@resend.dev>',
    RESEND_API_KEY: process.env.RESEND_API_KEY,

    SANITY_WEBHOOK_SECRET: process.env.SANITY_WEBHOOK_SECRET,
    CF_DEPLOY_HOOK_URL: process.env.CF_DEPLOY_HOOK_URL,
    REBUILD_COMMAND: process.env.REBUILD_COMMAND,
    REBUILD_DEBOUNCE_MS: intEnv('REBUILD_DEBOUNCE_MS', 60_000),
    REBUILD_LOCK_PATH:
      process.env.REBUILD_LOCK_PATH ||
      (isProduction
        ? '/var/log/jsone/rebuild.node.lock'
        : path.join(os.tmpdir(), 'jsone-rebuild.node.lock')),
    REBUILD_LOG_PATH:
      process.env.REBUILD_LOG_PATH ||
      (isProduction ? '/var/log/jsone/rebuild.log' : path.join(os.tmpdir(), 'jsone-rebuild.log')),

    CONTACT_RATE_LIMIT: intEnv('CONTACT_RATE_LIMIT', 5),
    CONTACT_RATE_WINDOW_MS: intEnv('CONTACT_RATE_WINDOW_MS', 15 * 60_000),
    WEBHOOK_RATE_LIMIT: intEnv('WEBHOOK_RATE_LIMIT', 60),
    WEBHOOK_RATE_WINDOW_MS: intEnv('WEBHOOK_RATE_WINDOW_MS', 60 * 60_000),

    CONTENT_SECURITY_POLICY: process.env.CONTENT_SECURITY_POLICY,

    SANITY_PREVIEW_SECRET: process.env.SANITY_PREVIEW_SECRET,
  }
}
