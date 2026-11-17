import assert from 'node:assert/strict'
import {describe, it} from 'node:test'
import {isValidMalaysiaPhoneOrEmpty, normalizeMalaysiaPhone} from './malaysiaPhone.js'

describe('isValidMalaysiaPhoneOrEmpty', () => {
  it('allows empty', () => {
    assert.equal(isValidMalaysiaPhoneOrEmpty(''), true)
    assert.equal(isValidMalaysiaPhoneOrEmpty('   '), true)
  })

  it('accepts common MY shapes', () => {
    assert.equal(isValidMalaysiaPhoneOrEmpty('+60 12-345 6789'), true)
    assert.equal(isValidMalaysiaPhoneOrEmpty('012-3456789'), true)
    assert.equal(isValidMalaysiaPhoneOrEmpty('60312345678'), true)
    assert.equal(isValidMalaysiaPhoneOrEmpty('03-2123 4567'), true)
  })

  it('rejects other country codes and garbage when non-empty', () => {
    assert.equal(isValidMalaysiaPhoneOrEmpty('+65 9123 4567'), false)
    assert.equal(isValidMalaysiaPhoneOrEmpty('abc'), false)
    assert.equal(isValidMalaysiaPhoneOrEmpty('123'), false)
  })
})

describe('normalizeMalaysiaPhone', () => {
  it('returns null for empty', () => {
    assert.equal(normalizeMalaysiaPhone(''), null)
  })

  it('normalizes local 0… to 60…', () => {
    assert.equal(normalizeMalaysiaPhone('012-345 6789'), '60123456789')
  })

  it('keeps +60 / 60 digits', () => {
    assert.equal(normalizeMalaysiaPhone('+60123456789'), '60123456789')
    assert.equal(normalizeMalaysiaPhone('60 12 345 6789'), '60123456789')
  })
})
