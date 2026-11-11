import {ThLargeIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const servicesGrid = defineType({
  name: 'servicesGrid',
  title: 'Services grid',
  type: 'object',
  icon: ThLargeIcon,
  fields: [
    defineField({name: 'heading', title: 'Heading', type: 'string'}),
    defineField({name: 'intro', title: 'Intro', type: 'text', rows: 3}),
    defineField({
      name: 'items',
      title: 'Services',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'serviceItem',
          fields: [
            defineField({name: 'title', type: 'string', title: 'Title', validation: (r) => r.required()}),
            defineField({name: 'description', type: 'text', title: 'Description', rows: 3}),
            defineField({name: 'icon', type: 'string', title: 'Icon key', description: 'Optional icon identifier'}),
            defineField({name: 'link', type: 'link', title: 'Link'}),
          ],
          preview: {select: {title: 'title', subtitle: 'description'}},
        }),
      ],
      validation: (rule) => rule.min(1),
    }),
  ],
  preview: {
    select: {title: 'heading'},
    prepare: ({title}) => ({title: title || 'Services grid', subtitle: 'Services grid'}),
  },
})

export const homeServicesGrid = defineType({
  name: 'homeServicesGrid',
  title: 'Services grid (localized)',
  type: 'object',
  icon: ThLargeIcon,
  fields: [
    defineField({name: 'heading', title: 'Heading', type: 'localeString'}),
    defineField({name: 'intro', title: 'Intro', type: 'localeText'}),
    defineField({
      name: 'items',
      title: 'Services',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'homeServiceItem',
          fields: [
            defineField({name: 'title', type: 'localeString', title: 'Title'}),
            defineField({name: 'description', type: 'localeText', title: 'Description'}),
            defineField({name: 'icon', type: 'string', title: 'Icon key'}),
            defineField({name: 'link', type: 'localeLink', title: 'Link'}),
          ],
          preview: {
            select: {title: 'title.en.value'},
            prepare: ({title}) => ({title: title || 'Service'}),
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {title: 'heading.en.value'},
    prepare: ({title}) => ({title: title || 'Services grid', subtitle: 'Services grid (localized)'}),
  },
})
