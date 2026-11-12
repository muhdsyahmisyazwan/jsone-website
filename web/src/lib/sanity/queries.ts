import groq from 'groq'

const imageFields = /* groq */ `
  ...,
  asset->{
    _id,
    url,
    metadata { dimensions, lqip }
  }
`

const localeStringFields = /* groq */ `{ en, ms, zh }`

export const siteSettingsQuery = groq`*[_type == "siteSettings" && _id == "siteSettings"][0]{
  siteName,
  legalName,
  tagline,
  logo{ ${imageFields}, alt },
  email,
  phone,
  address,
  socialLinks[]{ platform, url, label },
  defaultSeo{
    metaTitle,
    metaDescription,
    ogImage{ ${imageFields}, alt }
  }
}`

export const navigationQuery = groq`*[_type == "navigation" && _id == "navigation"][0]{
  title,
  items[]{
    label,
    linkType,
    internalPath,
    href,
    children[]{ label, internalPath }
  }
}`

export const footerQuery = groq`*[_type == "footer" && _id == "footer"][0]{
  tagline,
  columns[]{
    heading,
    links[]{ label, linkType, internalPath, href, openInNewTab }
  },
  legalLinks[]{ label, linkType, internalPath, href, openInNewTab },
  copyright
}`

/** coalesce(reviewed, true): legacy docs without the field still render; explicit false hides. */
export const homePageQuery = groq`*[_type == "homePage" && _id == "homePage" && coalesce(reviewed, true) == true][0]{
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

export const pagesByLanguageQuery = groq`*[_type == "page" && language == $locale && reviewed == true && defined(slug.current)]{
  _id,
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

export const pageBySlugQuery = groq`*[_type == "page" && language == $locale && reviewed == true && slug.current == $slug][0]{
  _id,
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

export const newsListQuery = groq`*[_type == "news" && language == $locale && reviewed == true] | order(publishedAt desc){
  _id,
  title,
  "slug": slug.current,
  language,
  excerpt,
  publishedAt,
  mainImage{ ${imageFields}, alt }
}`

export const newsBySlugQuery = groq`*[_type == "news" && language == $locale && reviewed == true && slug.current == $slug][0]{
  _id,
  title,
  "slug": slug.current,
  language,
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

export const allPageSlugsQuery = groq`*[_type == "page" && reviewed == true && defined(slug.current)]{
  "slug": slug.current,
  language
}`

export const allNewsSlugsQuery = groq`*[_type == "news" && reviewed == true && defined(slug.current)]{
  "slug": slug.current,
  language
}`

// silence unused - kept for docs / future portable-text projections
void localeStringFields
