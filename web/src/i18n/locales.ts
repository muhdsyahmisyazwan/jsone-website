/** Active public locales (English-first; MS/ZH can return later). */
export const locales = ['en'] as const;

/** CMS / content locale codes still supported for field resolution. */
export type Locale = 'en' | 'ms' | 'zh';

export type PublicLocale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

/** BCP 47 tags for <html lang> and hreflang */
export const htmlLang: Record<Locale, string> = {
  en: 'en',
  ms: 'ms',
  zh: 'zh-Hans',
};

export const localeLabels: Record<Locale, string> = {
  en: 'English',
  ms: 'Bahasa Melayu',
  zh: '简体中文',
};

export function isLocale(value: string): value is Locale {
  return value === 'en' || value === 'ms' || value === 'zh';
}

export function isPublicLocale(value: string): value is PublicLocale {
  return (locales as readonly string[]).includes(value);
}

/**
 * Resolve the active locale from an Astro pathname.
 * English has no prefix; Malay is /ms/…; Chinese is /zh/….
 * Public site is English-only for now.
 */
export function getLocaleFromPath(pathname: string): Locale {
  const segment = pathname.replace(/^\/+/, '').split('/')[0];
  if (segment === 'ms' || segment === 'zh') return segment;
  return defaultLocale;
}

/**
 * Strip the locale prefix from a pathname, returning a locale-agnostic path
 * that always starts with `/` (e.g. `/about/`, `/`).
 */
export function stripLocaleFromPath(pathname: string): string {
  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const stripped = normalized.replace(/^\/(ms|zh)(?=\/|$)/, '') || '/';
  return stripped.endsWith('/') || stripped.includes('.') ? stripped : `${stripped}/`;
}
