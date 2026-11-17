/**
 * Malaysian phone helpers for the contact API.
 * Empty input is valid (phone is optional). Non-empty values must parse as MY (+60 / 0…).
 */

const MIN_NATIONAL = 8
const MAX_NATIONAL = 10

/** Digits only with country code 60, or null if empty/invalid. */
export function normalizeMalaysiaPhone(input: string): string | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  let digits = trimmed.replace(/[^\d+]/g, '')
  if (digits.startsWith('+')) digits = digits.slice(1)
  if (!/^\d+$/.test(digits)) return null

  if (digits.startsWith('0')) {
    digits = `60${digits.slice(1)}`
  }

  if (!digits.startsWith('60')) return null

  const national = digits.slice(2)
  if (national.length < MIN_NATIONAL || national.length > MAX_NATIONAL) return null
  if (!/^\d+$/.test(national)) return null

  return digits
}

export function isValidMalaysiaPhoneOrEmpty(input: string): boolean {
  if (!input.trim()) return true
  return normalizeMalaysiaPhone(input) !== null
}
