import {defineField, defineType} from 'sanity'
import {locales} from '../../lib/locales'

/**
 * Field-level string: EN / MS / ZH side by side, each with a reviewed flag.
 * Unreviewed values must not be published to the live site (enforced in Phase 3 queries).
 */
export const localeString = defineType({
  name: 'localeString',
  title: 'Localized string',
  type: 'object',
  options: {columns: 3},
  fields: locales.map((locale) =>
    defineField({
      name: locale.id,
      title: locale.short,
      type: 'object',
      options: {columns: 1},
      fields: [
        defineField({
          name: 'value',
          title: 'Text',
          type: 'string',
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
