import {defaultLocale, type Locale} from '../../i18n/locales'
import type {LocaleEntry, LocaleString} from './types'

/**
 * Resolve a field-level localized value.
 * Prefers the requested locale when reviewed; falls back to English when reviewed.
 * Unreviewed entries are skipped so they never ship by accident.
 */
export function resolveLocaleValue(
  field: LocaleString | undefined | null,
  locale: Locale,
): string | undefined {
  if (!field) return undefined

  const pick = (loc: Locale): string | undefined => {
    const entry = field[loc] as LocaleEntry | undefined
    if (!entry?.value?.trim()) return undefined
    if (!entry.reviewed) return undefined
    return entry.value.trim()
  }

  return pick(locale) ?? (locale !== defaultLocale ? pick(defaultLocale) : undefined)
}

/** Like resolveLocaleValue but returns '' instead of undefined. */
export function resolveLocaleString(
  field: LocaleString | undefined | null,
  locale: Locale,
  fallback = '',
): string {
  return resolveLocaleValue(field, locale) ?? fallback
}

/**
 * Alt text from a localizedImage (alt is localeString) or contentImage (alt is string).
 */
export function resolveImageAlt(
  image: {alt?: string | LocaleString} | undefined | null,
  locale: Locale,
  fallback = '',
): string {
  if (!image?.alt) return fallback
  if (typeof image.alt === 'string') return image.alt
  return resolveLocaleString(image.alt, locale, fallback)
}
