import type {Locale} from '../../i18n/locales'
import {t} from '../../i18n/utils'
import {
  getAllNewsSlugs,
  getAllPageSlugs,
  getNewsBySlug,
  getNewsList,
  getPageBySlug,
  getSiteChrome,
  reservedSlugs,
} from '../sanity/api'
import {resolveLocaleString} from '../sanity/locale'
import type {Footer, Navigation, NewsDoc, PageDoc, SiteSettings} from '../sanity/types'

export async function loadChrome() {
  return getSiteChrome()
}

export async function loadContentPage(locale: Locale, slug: string) {
  const [{settings, navigation, footer}, page] = await Promise.all([
    getSiteChrome(),
    getPageBySlug(locale, slug),
  ])

  if (!page) return null

  const title =
    page.seo?.metaTitle ||
    `${page.title} - ${resolveLocaleString(settings?.siteName, locale) || t(locale, 'site.name')}`
  const description = page.seo?.metaDescription || page.title || ''

  return {settings, navigation, footer, page, title, description}
}

/**
 * CMS-first loader for dedicated static routes (about, solutions, contact, …).
 * Returns chrome + optional page; callers render Sections or a fallback component.
 */
export async function loadCmsOrFallbackRoute(
  locale: Locale,
  slug: string,
  fallbackMeta: {titleKey: string; descriptionKey: string},
) {
  const [{settings, navigation, footer}, page] = await Promise.all([
    getSiteChrome(),
    getPageBySlug(locale, slug),
  ])

  const siteName =
    resolveLocaleString(settings?.siteName, locale) || t(locale, 'site.name')
  const hasSections = Boolean(page?.sections?.length)
  const title = hasSections
    ? page!.seo?.metaTitle || `${page!.title} - ${siteName}`
    : `${t(locale, fallbackMeta.titleKey)} - ${siteName}`
  const description = hasSections
    ? page!.seo?.metaDescription || page!.title || ''
    : t(locale, fallbackMeta.descriptionKey)

  return {
    locale,
    settings,
    navigation,
    footer,
    page: hasSections ? page : null,
    title,
    description,
  }
}

export async function loadAboutRoute(
  locale: Locale,
  slug: 'about' | 'about-team',
  fallbackMeta: {titleKey: string; descriptionKey: string},
) {
  return loadCmsOrFallbackRoute(locale, slug, fallbackMeta)
}

export async function loadNewsIndex(locale: Locale) {
  const [{settings, navigation, footer}, articles] = await Promise.all([
    getSiteChrome(),
    getNewsList(locale),
  ])
  const siteName =
    resolveLocaleString(settings?.siteName, locale) || t(locale, 'site.name')
  return {
    settings,
    navigation,
    footer,
    articles,
    title: `${t(locale, 'nav.news')} - ${siteName}`,
    description: t(locale, 'home.description'),
  }
}

export async function loadNewsArticle(locale: Locale, slug: string) {
  const [{settings, navigation, footer}, article] = await Promise.all([
    getSiteChrome(),
    getNewsBySlug(locale, slug),
  ])
  if (!article) return null
  const siteName =
    resolveLocaleString(settings?.siteName, locale) || t(locale, 'site.name')
  return {
    settings,
    navigation,
    footer,
    article,
    title: article.seo?.metaTitle || `${article.title} - ${siteName}`,
    description: article.seo?.metaDescription || article.excerpt || '',
  }
}

/**
 * Build static paths for a locale. Includes that locale’s reviewed docs,
 * plus English slugs so missing translations can fall back to EN content.
 */
export async function pageStaticPaths(locale: Locale) {
  const slugs = await getAllPageSlugs()
  const localeSlugs = slugs.filter(
    (s) => s.language === locale && s.slug && !reservedSlugs.has(s.slug),
  )
  const enSlugs = slugs.filter(
    (s) => s.language === 'en' && s.slug && !reservedSlugs.has(s.slug),
  )
  const seen = new Set(localeSlugs.map((s) => s.slug))
  const merged =
    locale === 'en'
      ? localeSlugs
      : [...localeSlugs, ...enSlugs.filter((s) => !seen.has(s.slug))]

  return merged.map((s) => ({
    params: {slug: s.slug},
    props: {locale},
  }))
}

export async function newsStaticPaths(locale: Locale) {
  const slugs = await getAllNewsSlugs()
  const localeSlugs = slugs.filter((s) => s.language === locale && s.slug)
  const enSlugs = slugs.filter((s) => s.language === 'en' && s.slug)
  const seen = new Set(localeSlugs.map((s) => s.slug))
  const merged =
    locale === 'en'
      ? localeSlugs
      : [...localeSlugs, ...enSlugs.filter((s) => !seen.has(s.slug))]

  return merged.map((s) => ({
    params: {slug: s.slug},
    props: {locale},
  }))
}

export type {PageDoc, NewsDoc, SiteSettings, Navigation, Footer}
