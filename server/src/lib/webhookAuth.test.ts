import assert from 'node:assert/strict'
import {createHmac} from 'node:crypto'
import {describe, it} from 'node:test'
import {authorizeWebhook, verifySanitySignature} from './webhookAuth.js'

const secret = 'test-webhook-secret'

describe('authorizeWebhook', () => {
  it('rejects when secret is missing', () => {
    const result = authorizeWebhook({
      secret: undefined,
      authorization: 'Bearer x',
      headerSecret: undefined,
      signatureHeader: undefined,
      rawBody: '',
      queryHasSecret: false,
    })
    assert.equal(result.ok, false)
    if (!result.ok) assert.equal(result.error, 'unauthorized')
  })

  it('rejects query-string secret without header auth', () => {
    const result = authorizeWebhook({
      secret,
      authorization: undefined,
      headerSecret: undefined,
      signatureHeader: undefined,
      rawBody: '{}',
      queryHasSecret: true,
    })
    assert.equal(result.ok, false)
    if (!result.ok) assert.equal(result.error, 'secret_in_query_rejected')
  })

  it('accepts x-sanity-webhook-secret header', () => {
    const result = authorizeWebhook({
      secret,
      authorization: undefined,
      headerSecret: secret,
      signatureHeader: undefined,
      rawBody: '{}',
      queryHasSecret: false,
    })
    assert.deepEqual(result, {ok: true, via: 'header'})
  })

  it('accepts Bearer token', () => {
    const result = authorizeWebhook({
      secret,
      authorization: `Bearer ${secret}`,
      headerSecret: undefined,
      signatureHeader: undefined,
      rawBody: '{}',
      queryHasSecret: false,
    })
    assert.deepEqual(result, {ok: true, via: 'bearer'})
  })

  it('accepts Sanity signature header', () => {
    const rawBody = '{"_type":"page"}'
    const t = String(Math.floor(Date.now() / 1000))
    const v1 = createHmac('sha256', secret).update(`${t}.${rawBody}`).digest('hex')
    const result = authorizeWebhook({
      secret,
      authorization: undefined,
      headerSecret: undefined,
      signatureHeader: `t=${t},v1=${v1}`,
      rawBody,
      queryHasSecret: false,
    })
    assert.deepEqual(result, {ok: true, via: 'signature'})
  })
})

describe('verifySanitySignature', () => {
  it('rejects skewed timestamps', () => {
    const rawBody = '{}'
    const t = String(Math.floor(Date.now() / 1000) - 10_000)
    const v1 = createHmac('sha256', secret).update(`${t}.${rawBody}`).digest('hex')
    assert.equal(verifySanitySignature(rawBody, `t=${t},v1=${v1}`, secret), false)
  })
})
