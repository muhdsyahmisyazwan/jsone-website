import type {Locale} from '../../i18n/locales'
import {t} from '../../i18n/utils'
import {getHomePage, getSiteChrome} from '../sanity/api'
import {resolveLocaleString} from '../sanity/locale'
import type {Footer, HomePage, Navigation, SiteSettings} from '../sanity/types'

export type HomePageData = {
  locale: Locale
  settings: SiteSettings | null
  navigation: Navigation | null
  footer: Footer | null
  home: HomePage | null
  title: string
  description: string
}

/**
 * CMS homepage only when Sanity returns a reviewed doc with sections.
 * Otherwise the route renders FallbackHome (see docs/SEED.md).
 */
export async function loadHome(locale: Locale): Promise<HomePageData> {
  const [{settings, navigation, footer}, home] = await Promise.all([
    getSiteChrome(),
    getHomePage(),
  ])

  const siteName =
    resolveLocaleString(settings?.siteName, locale) || t(locale, 'site.name')
  const hasCmsHome = Boolean(home?.sections?.length)
  const fallbackTitle = t(locale, 'home.metaTitle') || `${siteName} - ${t(locale, 'home.title')}`
  const fallbackDescription =
    t(locale, 'home.metaDescription') || t(locale, 'home.description')
  const title = hasCmsHome
    ? resolveLocaleString(home?.seo?.metaTitle, locale) || fallbackTitle
    : fallbackTitle
  const description = hasCmsHome
    ? resolveLocaleString(home?.seo?.metaDescription, locale) || fallbackDescription
    : fallbackDescription

  return {
    locale,
    settings,
    navigation,
    footer,
    home: hasCmsHome ? home : null,
    title,
    description,
  }
}
