import {Hono} from 'hono'
import type {AppEnv} from '../env.js'

type Variables = {env: AppEnv}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

async function verifyTurnstile(token: string, secret: string, ip: string | undefined) {
  const body = new URLSearchParams({secret, response: token})
  if (ip) body.set('remoteip', ip)
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body,
  })
  const data = (await res.json()) as {success?: boolean}
  return Boolean(data.success)
}

async function sendWithResend(
  apiKey: string,
  payload: {from: string; to: string; replyTo: string; subject: string; text: string},
) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: payload.from,
      to: [payload.to],
      reply_to: payload.replyTo,
      subject: payload.subject,
      text: payload.text,
    }),
  })
  return res.ok
}

export const contactRoutes = new Hono<{Variables: Variables}>()

contactRoutes.post('/contact', async (c) => {
  const env = c.get('env')

  try {
    const form = await c.req.formData()
    const name = String(form.get('name') || '').trim()
    const email = String(form.get('email') || '').trim()
    const phone = String(form.get('phone') || '').trim()
    const company = String(form.get('company') || '').trim()
    const message = String(form.get('message') || '').trim()
    const locale = String(form.get('locale') || 'en').trim()
    const consent = form.get('consent')
    const turnstileToken = String(form.get('cf-turnstile-response') || '').trim()
    // Honeypot (legacy `website` + current `company_url`) - bots fill these
    const honeypot = String(form.get('company_url') || form.get('website') || '').trim()

    if (honeypot) return c.json({ok: true})

    if (!name || !email || !message || !consent) {
      const missing = [
        !name && 'name',
        !email && 'email',
        !message && 'message',
        !consent && 'consent',
      ].filter(Boolean)
      console.warn('[contact] missing_fields', missing)
      return c.json({ok: false, error: 'missing_fields', missing}, 400)
    }
    if (!EMAIL_RE.test(email)) return c.json({ok: false, error: 'invalid_email'}, 400)
    if (message.length > 5000 || name.length > 200) {
      return c.json({ok: false, error: 'too_long'}, 400)
    }

    const skipTurnstile = env.TURNSTILE_SKIP === 'true'
    if (!skipTurnstile) {
      if (!env.TURNSTILE_SECRET_KEY) {
        console.error('[contact] TURNSTILE_SECRET_KEY not configured')
        return c.json({ok: false, error: 'server_misconfigured'}, 500)
      }
      const ip =
        c.req.header('cf-connecting-ip') ||
        c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
        undefined
      const human = await verifyTurnstile(turnstileToken, env.TURNSTILE_SECRET_KEY, ip)
      if (!human) return c.json({ok: false, error: 'turnstile_failed'}, 403)
    }

    const subject = `[JS One] Contact form (${locale}) - ${name}`
    const text = [
      `Name: ${name}`,
      `Email: ${email}`,
      phone ? `Phone: ${phone}` : null,
      company ? `Company: ${company}` : null,
      `Locale: ${locale}`,
      '',
      message,
    ]
      .filter(Boolean)
      .join('\n')

    if (!env.RESEND_API_KEY) {
      console.error('[contact] RESEND_API_KEY not set - logging only')
      console.log(JSON.stringify({subject, text}))
      return c.json({ok: true, delivered: false})
    }

    const sent = await sendWithResend(env.RESEND_API_KEY, {
      from: env.CONTACT_FROM_EMAIL,
      to: env.CONTACT_TO_EMAIL,
      replyTo: email,
      subject,
      text,
    })

    if (!sent) return c.json({ok: false, error: 'delivery_failed'}, 502)
    return c.json({ok: true, delivered: true})
  } catch (error) {
    console.error('[contact]', error)
    return c.json({ok: false, error: 'server_error'}, 500)
  }
})
