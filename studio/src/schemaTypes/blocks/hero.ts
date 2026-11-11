import {BoltIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const hero = defineType({
  name: 'hero',
  title: 'Hero',
  type: 'object',
  icon: BoltIcon,
  fields: [
    defineField({name: 'eyebrow', title: 'Eyebrow', type: 'string'}),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'body', title: 'Supporting text', type: 'text', rows: 3}),
    defineField({
      name: 'primaryCta',
      title: 'Primary CTA',
      type: 'link',
    }),
    defineField({
      name: 'secondaryCta',
      title: 'Secondary CTA',
      type: 'link',
    }),
    defineField({
      name: 'image',
      title: 'Background / hero image',
      type: 'contentImage',
    }),
    defineField({
      name: 'stats',
      title: 'Stats',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'stat',
          fields: [
            defineField({name: 'label', type: 'string', title: 'Label', validation: (r) => r.required()}),
            defineField({name: 'value', type: 'string', title: 'Value'}),
          ],
          preview: {select: {title: 'label', subtitle: 'value'}},
        }),
      ],
    }),
  ],
  preview: {
    select: {title: 'heading', media: 'image'},
    prepare: ({title, media}) => ({title: title || 'Hero', subtitle: 'Hero', media}),
  },
})

export const homeHero = defineType({
  name: 'homeHero',
  title: 'Hero (localized)',
  type: 'object',
  icon: BoltIcon,
  fields: [
    defineField({name: 'eyebrow', title: 'Eyebrow', type: 'localeString'}),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'localeString',
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'body', title: 'Supporting text', type: 'localeText'}),
    defineField({name: 'primaryCta', title: 'Primary CTA', type: 'localeLink'}),
    defineField({name: 'secondaryCta', title: 'Secondary CTA', type: 'localeLink'}),
    defineField({name: 'image', title: 'Background / hero image', type: 'localizedImage'}),
    defineField({
      name: 'stats',
      title: 'Stats',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'homeStat',
          fields: [
            defineField({name: 'label', type: 'localeString', title: 'Label'}),
            defineField({name: 'value', type: 'localeString', title: 'Value'}),
          ],
          preview: {
            select: {title: 'label.en.value'},
            prepare: ({title}) => ({title: title || 'Stat'}),
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {title: 'heading.en.value', media: 'image'},
    prepare: ({title, media}) => ({title: title || 'Hero', subtitle: 'Hero (localized)', media}),
  },
})
