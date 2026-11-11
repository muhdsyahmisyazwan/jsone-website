/** Shared env bindings for Cloudflare Pages Functions. */
export interface Env {
  /** Cloudflare Turnstile secret key */
  TURNSTILE_SECRET_KEY: string
  /** Where contact form emails are delivered */
  CONTACT_TO_EMAIL: string
  /** Optional From address (defaults to a no-reply on the site domain) */
  CONTACT_FROM_EMAIL?: string
  /** Resend API key - preferred mail transport */
  RESEND_API_KEY?: string
  /** Cloudflare Pages Deploy Hook URL (triggered by Sanity webhook) */
  CF_DEPLOY_HOOK_URL: string
  /** Shared secret Sanity sends as header / query (e.g. ?secret=) */
  SANITY_WEBHOOK_SECRET: string
  /** Enables draft preview cookie when matching */
  SANITY_PREVIEW_SECRET: string
  /** Sanity read token for draft perspective (preview) */
  SANITY_API_READ_TOKEN?: string
  PUBLIC_SANITY_PROJECT_ID?: string
  PUBLIC_SANITY_DATASET?: string
}

export type PagesFunctionContext = EventContext<Env, string, Record<string, unknown>>
