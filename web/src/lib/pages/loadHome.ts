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

export async function loadHome(locale: Locale): Promise<HomePageData> {
  const [{settings, navigation, footer}, home] = await Promise.all([
    getSiteChrome(),
    getHomePage(),
  ])

  const siteName =
    resolveLocaleString(settings?.siteName, locale) || t(locale, 'site.name')
  const title =
    resolveLocaleString(home?.seo?.metaTitle, locale) ||
    `${siteName} - ${t(locale, 'home.title')}`
  const description =
    resolveLocaleString(home?.seo?.metaDescription, locale) ||
    t(locale, 'home.description')

  return {locale, settings, navigation, footer, home, title, description}
}
