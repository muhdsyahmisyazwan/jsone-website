import {localePath} from '../../i18n/paths'
import type {Locale} from '../../i18n/locales'
import {resolveLocaleString} from './locale'
import type {Link, LocaleLink} from './types'

export type ResolvedLink = {
  href: string
  label: string
  openInNewTab?: boolean
}

function normalizeInternalPath(path?: string): string {
  if (!path || path === '/') return '/'
  const withSlash = path.startsWith('/') ? path : `/${path}`
  return withSlash.endsWith('/') ? withSlash : `${withSlash}/`
}

export function resolveLink(link: Link | undefined, locale: Locale): ResolvedLink | null {
  if (!link?.label) return null

  switch (link.linkType) {
    case 'internal': {
      const path =
        link.internalPath ||
        (link.page?.slug ? `/${link.page.slug}/` : undefined)
      if (!path) return null
      return {
        href: localePath(locale, normalizeInternalPath(path)),
        label: link.label,
      }
    }
    case 'news': {
      const slug = link.news?.slug
      if (!slug) return null
      return {
        href: localePath(locale, `/news/${slug}/`),
        label: link.label,
      }
    }
    case 'external':
      if (!link.href) return null
      return {
        href: link.href,
        label: link.label,
        openInNewTab: link.openInNewTab ?? true,
      }
    case 'email':
      if (!link.href) return null
      return {
        href: link.href.startsWith('mailto:') ? link.href : `mailto:${link.href}`,
        label: link.label,
      }
    case 'phone':
      if (!link.href) return null
      return {
        href: link.href.startsWith('tel:') ? link.href : `tel:${link.href.replace(/\s/g, '')}`,
        label: link.label,
      }
    default:
      return null
  }
}

export function resolveLocaleLink(
  link: LocaleLink | undefined,
  locale: Locale,
): ResolvedLink | null {
  if (!link) return null
  const label = resolveLocaleString(link.label, locale)
  if (!label) return null

  return resolveLink(
    {
      label,
      linkType: link.linkType,
      internalPath: link.internalPath,
      href: link.href,
      openInNewTab: link.openInNewTab,
    },
    locale,
  )
}
