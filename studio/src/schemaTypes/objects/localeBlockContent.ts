import {defineArrayMember, defineField, defineType} from 'sanity'
import {locales} from '../../lib/locales'

const blockContent = [
  defineArrayMember({
    type: 'block',
    styles: [
      {title: 'Normal', value: 'normal'},
      {title: 'H2', value: 'h2'},
      {title: 'H3', value: 'h3'},
      {title: 'Quote', value: 'blockquote'},
    ],
    lists: [
      {title: 'Bullet', value: 'bullet'},
      {title: 'Numbered', value: 'number'},
    ],
    marks: {
      decorators: [
        {title: 'Bold', value: 'strong'},
        {title: 'Italic', value: 'em'},
      ],
      annotations: [
        {
          name: 'link',
          type: 'object',
          title: 'Link',
          fields: [
            defineField({
              name: 'href',
              type: 'url',
              title: 'URL',
              validation: (rule) =>
                rule.uri({allowRelative: true, scheme: ['http', 'https', 'mailto', 'tel']}),
            }),
            defineField({
              name: 'blank',
              type: 'boolean',
              title: 'Open in new tab',
              initialValue: false,
            }),
          ],
        },
      ],
    },
  }),
]

export const localeBlockContent = defineType({
  name: 'localeBlockContent',
  title: 'Localized rich text',
  type: 'object',
  options: {columns: 1},
  fields: locales.map((locale) =>
    defineField({
      name: locale.id,
      title: locale.title,
      type: 'object',
      fields: [
        defineField({
          name: 'value',
          title: 'Content',
          type: 'array',
          of: blockContent,
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

/** Non-localized portable text for document-level translated pages/news. */
export const blockContentSimple = defineType({
  name: 'blockContent',
  title: 'Rich text',
  type: 'array',
  of: blockContent,
})
