import type {Env} from '../types'

interface TurnstileResult {
  success: boolean
  'error-codes'?: string[]
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  })
}

async function verifyTurnstile(
  token: string,
  secret: string,
  ip: string | null,
): Promise<boolean> {
  const body = new URLSearchParams({
    secret,
    response: token,
  })
  if (ip) body.set('remoteip', ip)

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body,
  })
  const data = (await res.json()) as TurnstileResult
  return Boolean(data.success)
}

async function sendWithResend(
  apiKey: string,
  payload: {
    from: string
    to: string
    replyTo: string
    subject: string
    text: string
  },
): Promise<boolean> {
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

/** Cloudflare Email Routing / MailChannels-compatible fallback via Resend-only for reliability. */
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const {request, env} = context

  try {
    const form = await request.formData()
    const name = String(form.get('name') || '').trim()
    const email = String(form.get('email') || '').trim()
    const phone = String(form.get('phone') || '').trim()
    const company = String(form.get('company') || '').trim()
    const message = String(form.get('message') || '').trim()
    const locale = String(form.get('locale') || 'en').trim()
    const consent = form.get('consent')
    const turnstileToken = String(form.get('cf-turnstile-response') || '').trim()
    // Honeypot - bots fill this; humans never see it
    const website = String(form.get('website') || '').trim()

    if (website) {
      return json({ok: true}) // silently accept bots
    }

    if (!name || !email || !message || !consent) {
      return json({ok: false, error: 'missing_fields'}, 400)
    }
    if (!EMAIL_RE.test(email)) {
      return json({ok: false, error: 'invalid_email'}, 400)
    }
    if (message.length > 5000 || name.length > 200) {
      return json({ok: false, error: 'too_long'}, 400)
    }

    if (!env.TURNSTILE_SECRET_KEY) {
      console.error('[contact] TURNSTILE_SECRET_KEY not configured')
      return json({ok: false, error: 'server_misconfigured'}, 500)
    }

    const ip = request.headers.get('CF-Connecting-IP')
    const human = await verifyTurnstile(turnstileToken, env.TURNSTILE_SECRET_KEY, ip)
    if (!human) {
      return json({ok: false, error: 'turnstile_failed'}, 403)
    }

    const to = env.CONTACT_TO_EMAIL || 'info@jsone.com.my'
    const from = env.CONTACT_FROM_EMAIL || 'JS One Website <onboarding@resend.dev>'
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
      console.error('[contact] RESEND_API_KEY not configured - logging enquiry only')
      console.log(JSON.stringify({subject, text}))
      // Still return success in non-prod misconfig so UX isn't blocked during setup;
      // require Resend in production by setting the secret.
      return json({ok: true, delivered: false})
    }

    const sent = await sendWithResend(env.RESEND_API_KEY, {
      from,
      to,
      replyTo: email,
      subject,
      text,
    })

    if (!sent) {
      return json({ok: false, error: 'delivery_failed'}, 502)
    }

    return json({ok: true, delivered: true})
  } catch (error) {
    console.error('[contact]', error)
    return json({ok: false, error: 'server_error'}, 500)
  }
}
