import type {Locale} from '../../i18n/locales'

export type LocaleEntry<T = string> = {
  value?: T
  reviewed?: boolean
}

export type LocaleString = Partial<Record<Locale, LocaleEntry<string>>>
export type LocaleText = LocaleString

export type SanityImageMetadata = {
  dimensions?: {
    width?: number
    height?: number
    aspectRatio?: number
  }
  lqip?: string
}

export type SanityImage = {
  _type?: string
  asset?: {
    _ref?: string
    _id?: string
    url?: string
    metadata?: SanityImageMetadata
  }
  alt?: string | LocaleString
  hotspot?: {x: number; y: number; height: number; width: number}
  crop?: {top: number; bottom: number; left: number; right: number}
}

export type Link = {
  label?: string
  linkType?: 'internal' | 'news' | 'external' | 'email' | 'phone'
  internalPath?: string
  href?: string
  openInNewTab?: boolean
  page?: {slug?: string}
  news?: {slug?: string}
}

export type LocaleLink = {
  label?: LocaleString
  linkType?: Link['linkType']
  internalPath?: string
  href?: string
  openInNewTab?: boolean
}

export type Seo = {
  metaTitle?: string
  metaDescription?: string
  ogImage?: SanityImage
}

export type LocaleSeo = {
  metaTitle?: LocaleString
  metaDescription?: LocaleText
  ogImage?: SanityImage
}

export type SocialLink = {
  platform?: string
  url?: string
  label?: LocaleString
}

export type SiteSettings = {
  siteName?: LocaleString
  legalName?: string
  tagline?: LocaleString
  logo?: SanityImage
  email?: string
  phone?: string
  address?: LocaleText
  socialLinks?: SocialLink[]
  defaultSeo?: LocaleSeo
}

export type NavChild = {
  label?: LocaleString
  internalPath?: string
}

export type NavItem = {
  label?: LocaleString
  linkType?: 'internal' | 'external'
  internalPath?: string
  href?: string
  children?: NavChild[]
}

export type Navigation = {
  title?: string
  items?: NavItem[]
}

export type FooterColumn = {
  heading?: LocaleString
  links?: LocaleLink[]
}

export type Footer = {
  tagline?: LocaleString
  columns?: FooterColumn[]
  legalLinks?: LocaleLink[]
  copyright?: LocaleString
}

export type PortableTextBlock = {
  _type: string
  _key?: string
  style?: string
  listItem?: string
  level?: number
  children?: Array<{_type: string; text?: string; marks?: string[]}>
  markDefs?: Array<{_type: string; _key: string; href?: string; blank?: boolean}>
}

export type Section = {
  _type: string
  _key: string
  [key: string]: unknown
}

export type HomePage = {
  title?: string
  reviewed?: boolean
  sections?: Section[]
  seo?: LocaleSeo
}

export type PageDoc = {
  _id: string
  title?: string
  slug?: string
  language?: Locale
  reviewed?: boolean
  sections?: Section[]
  seo?: Seo
}

export type NewsDoc = {
  _id: string
  title?: string
  slug?: string
  language?: Locale
  reviewed?: boolean
  excerpt?: string
  publishedAt?: string
  mainImage?: SanityImage
  body?: PortableTextBlock[]
  seo?: Seo
}

export type SiteChrome = {
  settings: SiteSettings | null
  navigation: Navigation | null
  footer: Footer | null
}
