/** Draft projections mirror web build queries but omit `reviewed == true`. */

const imageFields = `
  ...,
  asset->{
    _id,
    url,
    metadata { dimensions, lqip }
  }
`

export const draftHomePageQuery = `*[_type == "homePage" && _id == "homePage"][0]{
  _id,
  _updatedAt,
  title,
  reviewed,
  seo{
    metaTitle,
    metaDescription,
    ogImage{ ${imageFields}, alt }
  },
  sections[]{
    ...,
    _type,
    _key,
    image{ ${imageFields}, alt },
    avatar{ ${imageFields}, alt },
    photo{ ${imageFields}, alt },
    logos[]{ ..., image{ ${imageFields}, alt } },
    items[]{ ..., avatar{ ${imageFields}, alt }, photo{ ${imageFields}, alt }, image{ ${imageFields}, alt } },
    groups[]{
      ...,
      members[]{ ..., photo{ ${imageFields}, alt } }
    },
    primaryCta,
    secondaryCta,
    cta,
    stats[]{ ... },
  }
}`

export const draftPageBySlugQuery = `*[_type == "page" && language == $locale && slug.current == $slug][0]{
  _id,
  _updatedAt,
  title,
  "slug": slug.current,
  language,
  reviewed,
  seo{
    metaTitle,
    metaDescription,
    ogImage{ ${imageFields}, alt }
  },
  sections[]{
    ...,
    image{ ${imageFields}, alt },
    logos[]{ ..., image{ ${imageFields}, alt } },
    items[]{ ..., avatar{ ${imageFields}, alt }, photo{ ${imageFields}, alt }, image{ ${imageFields}, alt } },
    groups[]{ ..., members[]{ ..., photo{ ${imageFields}, alt } } },
    primaryCta,
    secondaryCta,
    cta,
  }
}`

export const draftNewsBySlugQuery = `*[_type == "news" && language == $locale && slug.current == $slug][0]{
  _id,
  _updatedAt,
  title,
  "slug": slug.current,
  language,
  reviewed,
  excerpt,
  publishedAt,
  mainImage{ ${imageFields}, alt },
  body,
  seo{
    metaTitle,
    metaDescription,
    ogImage{ ${imageFields}, alt }
  }
}`

export type DraftRoute =
  | {type: 'homePage'}
  | {type: 'page'; slug: string; locale: string}
  | {type: 'news'; slug: string; locale: string}
  | {type: 'unknown'}

const RESERVED = new Set([
  'api',
  'privacy',
  'terms',
  '_astro',
  'images',
  'favicon.ico',
  'robots.txt',
  'sitemap-index.xml',
])

/** Map a public pathname to a draft document lookup. */
export function resolveDraftRoute(pathname: string): DraftRoute {
  const clean = pathname.split('?')[0].replace(/\/+$/, '') || '/'
  const parts = clean.replace(/^\/+/, '').split('/').filter(Boolean)

  if (parts.length === 0) return {type: 'homePage'}

  let locale = 'en'
  let rest = parts
  if (parts[0] === 'ms' || parts[0] === 'zh') {
    locale = parts[0]
    rest = parts.slice(1)
  }

  if (rest.length === 0) return {type: 'homePage'}

  if (rest[0] === 'news') {
    if (rest[1]) return {type: 'news', slug: rest[1], locale}
    return {type: 'unknown'}
  }

  if (rest[0] === 'about' && rest[1] === 'team') {
    return {type: 'page', slug: 'about-team', locale}
  }

  if (rest.length === 1 && !RESERVED.has(rest[0])) {
    return {type: 'page', slug: rest[0], locale}
  }

  return {type: 'unknown'}
}
