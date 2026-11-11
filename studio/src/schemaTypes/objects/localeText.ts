import {defineField, defineType} from 'sanity'
import {locales} from '../../lib/locales'

export const localeText = defineType({
  name: 'localeText',
  title: 'Localized text',
  type: 'object',
  options: {columns: 3},
  fields: locales.map((locale) =>
    defineField({
      name: locale.id,
      title: locale.short,
      type: 'object',
      fields: [
        defineField({
          name: 'value',
          title: 'Text',
          type: 'text',
          rows: 4,
        }),
        defineField({
          name: 'reviewed',
          title: 'Reviewed',
          type: 'boolean',
          description: 'Only reviewed translations are published.',
          initialValue: false,
        }),
      ],
    }),
  ),
})
