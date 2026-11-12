import {createImageUrlBuilder, type SanityImageSource} from '@sanity/image-url'
import {sanityClient, sanityConfigured} from './client'
import type {SanityImage} from './types'

const builder =
  sanityConfigured && sanityClient ? createImageUrlBuilder(sanityClient) : null

const DEFAULT_WIDTHS = [400, 800, 1200, 1600, 2000]

export function urlFor(source: SanityImageSource) {
  if (!builder) {
    throw new Error('Sanity image builder unavailable - set PUBLIC_SANITY_PROJECT_ID')
  }
  return builder.image(source)
}

export function hasImage(image?: SanityImage | null): boolean {
  return Boolean(image?.asset?._ref || image?.asset?._id || image?.asset?.url)
}

export type ImageSrcSet = {
  src: string
  srcSet: string
  sizes: string
  /** Display / request width used for the primary `src`. */
  width: number
  /** Derived from Sanity aspect ratio for CLS-stable layout. */
  height: number
  aspectRatio?: number
  lqip?: string
}

function getAspectRatio(image: SanityImage): number | undefined {
  const dims = image.asset?.metadata?.dimensions
  if (dims?.aspectRatio && dims.aspectRatio > 0) return dims.aspectRatio
  if (dims?.width && dims?.height && dims.height > 0) return dims.width / dims.height
  return undefined
}

/**
 * Responsive Sanity CDN URLs with auto format (WebP/AVIF when supported by the browser).
 * Sets width/height from asset metadata when available to reduce CLS.
 */
export function getResponsiveImage(
  image: SanityImage,
  options: {
    widths?: number[]
    sizes?: string
    maxWidth?: number
  } = {},
): ImageSrcSet | null {
  if (!builder || !hasImage(image)) return null

  const widths = options.widths ?? DEFAULT_WIDTHS
  const maxWidth = options.maxWidth ?? Math.max(...widths)
  const sizes = options.sizes ?? `(max-width: 768px) 100vw, min(100vw, ${maxWidth}px)`

  const base = builder.image(image).auto('format').fit('max').quality(80)

  const srcSet = widths
    .filter((w) => w <= maxWidth + 200)
    .map((w) => `${base.width(w).url()} ${w}w`)
    .join(', ')

  const width = Math.min(1200, maxWidth)
  const src = base.width(width).url()
  const aspectRatio = getAspectRatio(image)
  const height = aspectRatio ? Math.round(width / aspectRatio) : Math.round(width * 0.625)
  const lqip = image.asset?.metadata?.lqip

  return {src, srcSet, sizes, width, height, aspectRatio, lqip}
}
