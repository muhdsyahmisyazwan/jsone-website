import {InlineIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export const textImage = defineType({
  name: 'textImage',
  title: 'Text + image',
  type: 'object',
  icon: InlineIcon,
  fields: [
    defineField({name: 'heading', title: 'Heading', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'body', title: 'Body', type: 'blockContent'}),
    defineField({name: 'image', title: 'Image', type: 'contentImage', validation: (r) => r.required()}),
    defineField({
      name: 'imagePosition',
      title: 'Image position',
      type: 'string',
      options: {
        list: [
          {title: 'Image right', value: 'right'},
          {title: 'Image left', value: 'left'},
        ],
        layout: 'radio',
      },
      initialValue: 'right',
    }),
    defineField({name: 'cta', title: 'CTA', type: 'link'}),
  ],
  preview: {
    select: {title: 'heading', media: 'image'},
    prepare: ({title, media}) => ({title: title || 'Text + image', subtitle: 'Text + image', media}),
  },
})

export const homeTextImage = defineType({
  name: 'homeTextImage',
  title: 'Text + image (localized)',
  type: 'object',
  icon: InlineIcon,
  fields: [
    defineField({name: 'heading', title: 'Heading', type: 'localeString', validation: (r) => r.required()}),
    defineField({name: 'body', title: 'Body', type: 'localeBlockContent'}),
    defineField({name: 'image', title: 'Image', type: 'localizedImage', validation: (r) => r.required()}),
    defineField({
      name: 'imagePosition',
      title: 'Image position',
      type: 'string',
      options: {
        list: [
          {title: 'Image right', value: 'right'},
          {title: 'Image left', value: 'left'},
        ],
        layout: 'radio',
      },
      initialValue: 'right',
    }),
    defineField({name: 'cta', title: 'CTA', type: 'localeLink'}),
  ],
  preview: {
    select: {title: 'heading.en.value', media: 'image'},
    prepare: ({title, media}) => ({
      title: title || 'Text + image',
      subtitle: 'Text + image (localized)',
      media,
    }),
  },
})
