import {getResponsiveImage, hasImage} from './sanity/image'
import type {SanityImage} from './sanity/types'

export type PreloadImage = {
  src: string
  srcSet?: string
  sizes?: string
}

/** First CMS hero (or news) image suitable for `<link rel="preload" as="image">`. */
export function preloadFromImage(
  image: SanityImage | null | undefined,
  options: {maxWidth?: number; sizes?: string} = {},
): PreloadImage | undefined {
  if (!image || !hasImage(image)) return undefined
  const responsive = getResponsiveImage(image, {
    maxWidth: options.maxWidth ?? 1600,
    sizes: options.sizes,
  })
  if (!responsive) return undefined
  return {
    src: responsive.src,
    srcSet: responsive.srcSet,
    sizes: responsive.sizes,
  }
}

/** Scan page builder sections for the first hero image. */
export function preloadFromSections(
  sections: Array<{_type?: string; image?: unknown}> | null | undefined,
): PreloadImage | undefined {
  if (!sections?.length) return undefined
  for (const section of sections) {
    if (section._type === 'hero' || section._type === 'homeHero') {
      const preload = preloadFromImage(section.image as SanityImage | null | undefined, {
        maxWidth: 2000,
      })
      if (preload) return preload
    }
  }
  return undefined
}
