import type {Locale} from '../../i18n/locales'
import type {TranslationKey} from '../../i18n/utils'
import {t} from '../../i18n/utils'
import type {SanityImage as Img} from '../sanity/types'

export type TrustMetric = {
  value: string
  label: string
  /** What the number counts; shown under the label. */
  context?: string
}

export type TrustBadge = {
  name: string
  href?: string
}

export type TrustCertification = {
  title: string
}

export type TrustCase = {
  eyebrow: string
  title: string
  body: string
  metric?: string
  href?: string
}

export type TrustSector = {
  label: string
}

export type TrustTestimonial = {
  quote: string
  author?: string
  role?: string
  avatar?: Img
}

/** Delivery metrics with shared context. Hide band when fewer than two remain. */
export function getTrustMetrics(locale: Locale): TrustMetric[] {
  return (
    [
      {
        value: t(locale, 'home.statsExperienceValue'),
        label: t(locale, 'home.statsExperienceLabel'),
        context: t(locale, 'trust.metricExperienceContext'),
      },
      {
        value: t(locale, 'home.statsProjectsValue'),
        label: t(locale, 'home.statsProjectsLabel'),
        context: t(locale, 'trust.metricProjectsContext'),
      },
      {
        value: t(locale, 'home.statsClientsValue'),
        label: t(locale, 'home.statsClientsLabel'),
        context: t(locale, 'trust.metricClientsContext'),
      },
    ] as TrustMetric[]
  ).filter((metric) => metric.value.trim() && metric.label.trim())
}

export function getTrustMetricsContext(locale: Locale): string {
  return t(locale, 'trust.metricsContext')
}

/** Compact OpenText + SAP wordmarks for Solutions / Contact. */
export function getPartnerBadgesCompact(locale: Locale): TrustBadge[] {
  return (
    [
      {name: t(locale, 'home.partnerOpenText')},
      {name: t(locale, 'home.partnerSap')},
    ] as TrustBadge[]
  ).filter((badge) => badge.name.trim())
}

/** Homepage / Clients credential-style badges (text until licensed artwork lands). */
export function getPartnerBadgesFull(locale: Locale): TrustBadge[] {
  return (
    [
      {name: t(locale, 'home.proofCredentialReseller')},
      {name: t(locale, 'home.proofCredentialSap')},
    ] as TrustBadge[]
  ).filter((badge) => badge.name.trim())
}

export function getCertifications(locale: Locale): TrustCertification[] {
  const keys: TranslationKey[] = [
    'clients.recogOpentext',
    'clients.recogSapCompetence',
    'clients.recogSapAward',
    'clients.recogMsc',
  ]
  return keys
    .map((key) => ({title: t(locale, key)}))
    .filter((item) => item.title.trim())
}

export function getSectorPlaceholders(locale: Locale): TrustSector[] {
  const keys: TranslationKey[] = [
    'home.indOil',
    'home.indGov',
    'home.indFinance',
    'home.indTelco',
    'home.indHealthcare',
    'home.indManufacturing',
  ]
  return keys
    .map((key) => ({label: t(locale, key)}))
    .filter((item) => item.label.trim())
}

export function getCaseStudies(locale: Locale): TrustCase[] {
  const cases: Array<{
    titleKey: TranslationKey
    bodyKey: TranslationKey
    metricKey?: TranslationKey
  }> = [
    {
      titleKey: 'clients.case1Title',
      bodyKey: 'clients.case1Body',
    },
    {
      titleKey: 'clients.case2Title',
      bodyKey: 'clients.case2Body',
      metricKey: 'trust.caseGovMetric',
    },
    {
      titleKey: 'clients.case3Title',
      bodyKey: 'clients.case3Body',
    },
  ]

  const eyebrow = t(locale, 'home.proofCaseEyebrow')
  return cases
    .map((item) => ({
      eyebrow,
      title: t(locale, item.titleKey),
      body: t(locale, item.bodyKey),
      metric: item.metricKey ? t(locale, item.metricKey) : undefined,
    }))
    .filter((item) => item.title.trim() && item.body.trim())
}

/** Featured homepage / industries seed: government big-data case. */
export function getFeaturedCase(locale: Locale): TrustCase | undefined {
  return getCaseStudies(locale)[1]
}

/** Solutions page: OpenText/SAP-adjacent cases (oil & gas + government). */
export function getSolutionsCases(locale: Locale): TrustCase[] {
  return getCaseStudies(locale).slice(0, 2)
}

/**
 * Homepage Proof quote. Returns undefined until a reviewed CMS quote is supplied.
 * Fallback homepage never invents a testimonial.
 */
export function getFeaturedTestimonial(
  _locale: Locale,
  fromCms?: TrustTestimonial | null,
): TrustTestimonial | undefined {
  if (!fromCms?.quote?.trim()) return undefined
  return {
    quote: fromCms.quote.trim(),
    author: fromCms.author?.trim() || undefined,
    role: fromCms.role?.trim() || undefined,
    avatar: fromCms.avatar,
  }
}
