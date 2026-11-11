import {ImageIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'
import {locales} from '../../lib/locales'

export type LocaleStringShape = {
  [K in (typeof locales)[number]['id']]?: {value?: string; reviewed?: boolean}
}

/**
 * Image with required alt text per language (field-level).
 * Used in singletons / homepage sections.
 */
export const localizedImage = defineType({
  name: 'localizedImage',
  title: 'Localized image',
  type: 'image',
  icon: ImageIcon,
  options: {hotspot: true},
  fields: [
    defineField({
      name: 'alt',
      title: 'Alt text',
      type: 'localeString',
      description: 'Describe the image for each language (required for accessibility).',
      validation: (rule) =>
        rule.custom((alt: LocaleStringShape | undefined) => {
          if (!alt?.en?.value?.trim()) return 'English alt text is required'
          return true
        }),
    }),
  ],
  validation: (rule) => rule.required(),
})

/**
 * Image for document-level translations - single alt in that document's language.
 */
export const contentImage = defineType({
  name: 'contentImage',
  title: 'Image',
  type: 'image',
  icon: ImageIcon,
  options: {hotspot: true},
  fields: [
    defineField({
      name: 'alt',
      title: 'Alt text',
      type: 'string',
      description: 'Required. Write alt text in this document’s language.',
      validation: (rule) => rule.required().error('Alt text is required'),
    }),
  ],
  validation: (rule) => rule.required(),
})
