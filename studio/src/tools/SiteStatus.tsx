import {Card, Flex, Heading, Spinner, Stack, Text} from '@sanity/ui'
import {useEffect, useState} from 'react'

type HealthPayload = {
  ok?: boolean
  env?: string
  staticReady?: boolean
  contact?: {
    readyForProduction?: boolean
    turnstileConfigured?: boolean
    resendConfigured?: boolean
  }
  rebuild?: {
    configured?: boolean
    lastStartedAt?: string | null
    lastResult?: string | null
    lastError?: string | null
    logMtime?: string | null
    logAgeSec?: number | null
  }
}

function siteOrigin(): string {
  return (
    process.env.SANITY_STUDIO_PREVIEW_ORIGIN ||
    process.env.SANITY_STUDIO_SITE_URL ||
    'https://www.jsone.com.my'
  ).replace(/\/$/, '')
}

export function SiteStatusTool() {
  const [data, setData] = useState<HealthPayload | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const url = `${siteOrigin()}/api/health`
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(url, {credentials: 'omit'})
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = (await res.json()) as HealthPayload
        if (!cancelled) setData(json)
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error
              ? `${e.message} — is the site up and CORS allowing Studio?`
              : 'Failed to load health',
          )
          setData(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    const id = window.setInterval(load, 60_000)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [])

  const rebuild = data?.rebuild

  return (
    <Card padding={4} sizing="border" style={{minHeight: '100%'}}>
      <Stack space={4}>
        <Heading as="h2" size={2}>
          Site status
        </Heading>
        <Text muted size={1}>
          Live signals from <code>{siteOrigin()}/api/health</code>. Publish still needs a webhook
          rebuild before visitors see changes.
        </Text>

        {loading && !data && (
          <Flex align="center" gap={3}>
            <Spinner muted />
            <Text size={1}>Loading…</Text>
          </Flex>
        )}

        {error && (
          <Card padding={3} radius={2} tone="critical">
            <Text size={1}>{error}</Text>
          </Card>
        )}

        {data && (
          <Stack space={3}>
            <Card padding={3} radius={2} shadow={1} tone={data.staticReady ? 'positive' : 'caution'}>
              <Stack space={2}>
                <Text weight="semibold">Static site</Text>
                <Text size={1}>
                  Ready: {String(Boolean(data.staticReady))} · env: {data.env || '—'}
                </Text>
              </Stack>
            </Card>

            <Card
              padding={3}
              radius={2}
              shadow={1}
              tone={data.contact?.readyForProduction ? 'positive' : 'caution'}
            >
              <Stack space={2}>
                <Text weight="semibold">Contact form</Text>
                <Text size={1}>
                  Production-ready: {String(Boolean(data.contact?.readyForProduction))} (Turnstile{' '}
                  {data.contact?.turnstileConfigured ? 'ok' : 'missing'}, Resend{' '}
                  {data.contact?.resendConfigured ? 'ok' : 'missing'})
                </Text>
              </Stack>
            </Card>

            <Card padding={3} radius={2} shadow={1} tone={rebuild?.configured ? 'default' : 'caution'}>
              <Stack space={2}>
                <Text weight="semibold">Last rebuild</Text>
                <Text size={1}>Configured: {String(Boolean(rebuild?.configured))}</Text>
                <Text size={1}>Last started: {rebuild?.lastStartedAt || '—'}</Text>
                <Text size={1}>Result: {rebuild?.lastResult || '—'}</Text>
                <Text size={1}>Log mtime: {rebuild?.logMtime || '—'}</Text>
                <Text size={1}>
                  Log age:{' '}
                  {typeof rebuild?.logAgeSec === 'number' ? `${rebuild.logAgeSec}s` : '—'}
                </Text>
                {rebuild?.lastError && (
                  <Text size={1} style={{color: 'var(--card-badge-fg-color)'}}>
                    Error: {rebuild.lastError}
                  </Text>
                )}
              </Stack>
            </Card>
          </Stack>
        )}
      </Stack>
    </Card>
  )
}
