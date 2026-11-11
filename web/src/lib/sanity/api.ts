import {defaultLocale, type Locale} from '../../i18n/locales'
import {sanityFetch} from './client'
import {
  allNewsSlugsQuery,
  allPageSlugsQuery,
  footerQuery,
  homePageQuery,
  navigationQuery,
  newsBySlugQuery,
  newsListQuery,
  pageBySlugQuery,
  pagesByLanguageQuery,
  siteSettingsQuery,
} from './queries'
import type {
  Footer,
  HomePage,
  Navigation,
  NewsDoc,
  PageDoc,
  SiteChrome,
  SiteSettings,
} from './types'

export async function getSiteSettings(): Promise<SiteSettings | null> {
  return sanityFetch<SiteSettings>(siteSettingsQuery)
}

export async function getNavigation(): Promise<Navigation | null> {
  return sanityFetch<Navigation>(navigationQuery)
}

export async function getFooter(): Promise<Footer | null> {
  return sanityFetch<Footer>(footerQuery)
}

export async function getSiteChrome(): Promise<SiteChrome> {
  const [settings, navigation, footer] = await Promise.all([
    getSiteSettings(),
    getNavigation(),
    getFooter(),
  ])
  return {settings, navigation, footer}
}

export async function getHomePage(): Promise<HomePage | null> {
  return sanityFetch<HomePage>(homePageQuery)
}

export async function getPageBySlug(
  locale: Locale,
  slug: string,
): Promise<PageDoc | null> {
  const page = await sanityFetch<PageDoc>(pageBySlugQuery, {locale, slug})
  if (page) return page
  if (locale === defaultLocale) return null
  // Fall back to English document when a translation is missing / unreviewed
  return sanityFetch<PageDoc>(pageBySlugQuery, {locale: defaultLocale, slug})
}

export async function getPages(locale: Locale): Promise<PageDoc[]> {
  return (await sanityFetch<PageDoc[]>(pagesByLanguageQuery, {locale})) ?? []
}

export async function getNewsList(locale: Locale): Promise<NewsDoc[]> {
  const list = await sanityFetch<NewsDoc[]>(newsListQuery, {locale})
  if (list && list.length > 0) return list
  if (locale === defaultLocale) return list ?? []
  return (await sanityFetch<NewsDoc[]>(newsListQuery, {locale: defaultLocale})) ?? []
}

export async function getNewsBySlug(
  locale: Locale,
  slug: string,
): Promise<NewsDoc | null> {
  const article = await sanityFetch<NewsDoc>(newsBySlugQuery, {locale, slug})
  if (article) return article
  if (locale === defaultLocale) return null
  return sanityFetch<NewsDoc>(newsBySlugQuery, {locale: defaultLocale, slug})
}

export async function getAllPageSlugs(): Promise<{slug: string; language: Locale}[]> {
  return (
    (await sanityFetch<{slug: string; language: Locale}[]>(allPageSlugsQuery)) ?? []
  )
}

export async function getAllNewsSlugs(): Promise<{slug: string; language: Locale}[]> {
  return (
    (await sanityFetch<{slug: string; language: Locale}[]>(allNewsSlugsQuery)) ?? []
  )
}

/** Reserved first path segments that are not CMS `[slug]` pages. */
export const reservedSlugs = new Set([
  'about',
  'solutions',
  'industries',
  'clients',
  'contact',
  'news',
  'ms',
  'zh',
  'api',
  'privacy',
  'terms',
  '_astro',
  'images',
  'favicon.ico',
  'favicon.svg',
  'favicon-32.png',
  'favicon-48.png',
  'favicon-512.png',
  'apple-touch-icon.png',
])
