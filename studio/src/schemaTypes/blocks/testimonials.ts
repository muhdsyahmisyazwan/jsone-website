import {CommentIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const testimonials = defineType({
  name: 'testimonials',
  title: 'Testimonials',
  type: 'object',
  icon: CommentIcon,
  fields: [
    defineField({name: 'heading', title: 'Heading', type: 'string'}),
    defineField({
      name: 'items',
      title: 'Testimonials',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'testimonial',
          fields: [
            defineField({name: 'quote', type: 'text', title: 'Quote', rows: 4, validation: (r) => r.required()}),
            defineField({name: 'author', type: 'string', title: 'Author'}),
            defineField({name: 'role', type: 'string', title: 'Role / company'}),
            defineField({name: 'avatar', type: 'contentImage', title: 'Avatar'}),
          ],
          preview: {select: {title: 'author', subtitle: 'quote', media: 'avatar'}},
        }),
      ],
    }),
  ],
  preview: {
    select: {title: 'heading'},
    prepare: ({title}) => ({title: title || 'Testimonials', subtitle: 'Testimonials'}),
  },
})

export const homeTestimonials = defineType({
  name: 'homeTestimonials',
  title: 'Testimonials (localized)',
  type: 'object',
  icon: CommentIcon,
  fields: [
    defineField({name: 'heading', title: 'Heading', type: 'localeString'}),
    defineField({
      name: 'items',
      title: 'Testimonials',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'homeTestimonial',
          fields: [
            defineField({name: 'quote', type: 'localeText', title: 'Quote'}),
            defineField({name: 'author', type: 'string', title: 'Author'}),
            defineField({name: 'role', type: 'localeString', title: 'Role / company'}),
            defineField({name: 'avatar', type: 'localizedImage', title: 'Avatar'}),
          ],
          preview: {
            select: {title: 'author', subtitle: 'quote.en.value', media: 'avatar'},
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {title: 'heading.en.value'},
    prepare: ({title}) => ({title: title || 'Testimonials', subtitle: 'Testimonials (localized)'}),
  },
})
