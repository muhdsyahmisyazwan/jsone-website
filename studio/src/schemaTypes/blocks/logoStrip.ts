import {ImagesIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const logoStrip = defineType({
  name: 'logoStrip',
  title: 'Logo strip',
  type: 'object',
  icon: ImagesIcon,
  fields: [
    defineField({name: 'heading', title: 'Heading', type: 'string'}),
    defineField({
      name: 'logos',
      title: 'Logos',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'logoItem',
          fields: [
            defineField({name: 'image', type: 'contentImage', title: 'Logo', validation: (r) => r.required()}),
            defineField({name: 'href', type: 'url', title: 'Optional link'}),
          ],
          preview: {
            select: {title: 'image.alt', media: 'image'},
            prepare: ({title, media}) => ({title: title || 'Logo', media}),
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {title: 'heading'},
    prepare: ({title}) => ({title: title || 'Logo strip', subtitle: 'Logo strip'}),
  },
})

export const homeLogoStrip = defineType({
  name: 'homeLogoStrip',
  title: 'Logo strip (localized)',
  type: 'object',
  icon: ImagesIcon,
  fields: [
    defineField({name: 'heading', title: 'Heading', type: 'localeString'}),
    defineField({
      name: 'logos',
      title: 'Logos',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'homeLogoItem',
          fields: [
            defineField({name: 'image', type: 'localizedImage', title: 'Logo', validation: (r) => r.required()}),
            defineField({name: 'href', type: 'url', title: 'Optional link'}),
          ],
          preview: {
            select: {title: 'image.alt.en.value', media: 'image'},
            prepare: ({title, media}) => ({title: title || 'Logo', media}),
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {title: 'heading.en.value'},
    prepare: ({title}) => ({title: title || 'Logo strip', subtitle: 'Logo strip (localized)'}),
  },
})
