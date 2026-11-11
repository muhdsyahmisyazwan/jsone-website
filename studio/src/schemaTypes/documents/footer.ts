import {StackCompactIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const footer = defineType({
  name: 'footer',
  title: 'Footer',
  type: 'document',
  icon: StackCompactIcon,
  fields: [
    defineField({
      name: 'tagline',
      title: 'Tagline override',
      type: 'localeString',
      description: 'Optional. Falls back to site settings tagline.',
    }),
    defineField({
      name: 'columns',
      title: 'Link columns',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'footerColumn',
          fields: [
            defineField({name: 'heading', type: 'localeString', title: 'Heading'}),
            defineField({
              name: 'links',
              title: 'Links',
              type: 'array',
              of: [defineArrayMember({type: 'localeLink'})],
            }),
          ],
          preview: {
            select: {title: 'heading.en.value'},
            prepare: ({title}) => ({title: title || 'Column'}),
          },
        }),
      ],
    }),
    defineField({
      name: 'legalLinks',
      title: 'Legal links',
      type: 'array',
      of: [defineArrayMember({type: 'localeLink'})],
    }),
    defineField({
      name: 'copyright',
      title: 'Copyright suffix',
      type: 'localeString',
      description: 'e.g. “All rights reserved.” (year + legal name are added in the front end)',
    }),
  ],
  preview: {
    prepare: () => ({title: 'Footer'}),
  },
})
