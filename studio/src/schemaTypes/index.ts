import {hero, homeHero} from './blocks/hero'
import {textImage, homeTextImage} from './blocks/textImage'
import {servicesGrid, homeServicesGrid} from './blocks/servicesGrid'
import {team, homeTeam} from './blocks/team'
import {testimonials, homeTestimonials} from './blocks/testimonials'
import {cta, homeCta} from './blocks/cta'
import {faq, homeFaq} from './blocks/faq'
import {contactForm, homeContactForm} from './blocks/contactForm'
import {logoStrip, homeLogoStrip} from './blocks/logoStrip'

import {localeString} from './objects/localeString'
import {localeText} from './objects/localeText'
import {localeBlockContent, blockContentSimple} from './objects/localeBlockContent'
import {localizedImage, contentImage} from './objects/localizedImage'
import {localeSeo, seo} from './objects/seo'
import {link, localeLink} from './objects/link'

import {siteSettings} from './documents/siteSettings'
import {navigation} from './documents/navigation'
import {footer} from './documents/footer'
import {homePage} from './documents/homePage'
import {page} from './documents/page'
import {news} from './documents/news'

export const schemaTypes = [
  // Documents
  siteSettings,
  navigation,
  footer,
  homePage,
  page,
  news,

  // Page builder (document-level pages)
  hero,
  textImage,
  servicesGrid,
  team,
  testimonials,
  cta,
  faq,
  contactForm,
  logoStrip,

  // Page builder (homepage field-level)
  homeHero,
  homeTextImage,
  homeServicesGrid,
  homeTeam,
  homeTestimonials,
  homeCta,
  homeFaq,
  homeContactForm,
  homeLogoStrip,

  // Shared objects
  localeString,
  localeText,
  localeBlockContent,
  blockContentSimple,
  localizedImage,
  contentImage,
  localeSeo,
  seo,
  link,
  localeLink,
]
