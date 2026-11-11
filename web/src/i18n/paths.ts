import { getRelativeLocaleUrl } from 'astro:i18n';
import {
  defaultLocale,
  isPublicLocale,
  locales,
  stripLocaleFromPath,
  type Locale,
} from './locales';

/** Localized URL for a path (path without locale prefix, e.g. `/` or `/about/`). */
export function localePath(locale: Locale, path = '/'): string {
  const clean = path === '/' ? '/' : path.replace(/^\//, '').replace(/\/$/, '');
  // Site is English-first; never emit /ms or /zh routes for now.
  const publicLocale = isPublicLocale(locale) ? locale : defaultLocale;
  return getRelativeLocaleUrl(publicLocale, clean || undefined);
}

/**
 * Equivalent page URL in another locale, preserving the current path.
 * Example: `/ms/services/` → `/zh/services/` or `/services/` (en).
 */
export function switchLocalePath(currentPath: string, targetLocale: Locale): string {
  const bare = stripLocaleFromPath(currentPath);
  return localePath(targetLocale, bare);
}

/** All locale alternates for the current path (for hreflang). */
export function getLocaleAlternates(currentPath: string): { locale: Locale; href: string }[] {
  return locales.map((locale) => ({
    locale,
    href: switchLocalePath(currentPath, locale),
  }));
}

export { defaultLocale, locales };
