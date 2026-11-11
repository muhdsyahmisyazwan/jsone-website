import {defineDocuments, defineLocations} from 'sanity/presentation'

/**
 * Maps Studio documents → front-end routes for Presentation Tool.
 */
export const locations = {
  homePage: defineLocations({
    select: {},
    resolve: () => ({
      locations: [{title: 'Homepage', href: '/'}],
    }),
  }),
  page: defineLocations({
    select: {title: 'title', slug: 'slug.current', language: 'language'},
    resolve: (doc) => {
      const slug = doc?.slug as string | undefined
      const language = (doc?.language as string | undefined) || 'en'
      if (!slug) return {locations: []}
      const href =
        language === 'en' ? `/${slug}/` : `/${language}/${slug}/`
      return {
        locations: [
          {
            title: (doc?.title as string) || slug,
            href,
          },
        ],
      }
    },
  }),
  news: defineLocations({
    select: {title: 'title', slug: 'slug.current', language: 'language'},
    resolve: (doc) => {
      const slug = doc?.slug as string | undefined
      const language = (doc?.language as string | undefined) || 'en'
      if (!slug) return {locations: []}
      const href =
        language === 'en' ? `/news/${slug}/` : `/${language}/news/${slug}/`
      return {
        locations: [
          {
            title: (doc?.title as string) || slug,
            href,
          },
        ],
      }
    },
  }),
}

export const mainDocuments = defineDocuments([
  {
    route: '/',
    filter: `_type == "homePage"`,
  },
  {
    route: '/:slug',
    filter: `_type == "page" && language == "en" && slug.current == $slug`,
  },
  {
    route: '/:lang/:slug',
    filter: `_type == "page" && language == $lang && slug.current == $slug`,
  },
  {
    route: '/news/:slug',
    filter: `_type == "news" && language == "en" && slug.current == $slug`,
  },
  {
    route: '/:lang/news/:slug',
    filter: `_type == "news" && language == $lang && slug.current == $slug`,
  },
])
