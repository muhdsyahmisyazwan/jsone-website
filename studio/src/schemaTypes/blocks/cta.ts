import {LaunchIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export const cta = defineType({
  name: 'cta',
  title: 'CTA',
  type: 'object',
  icon: LaunchIcon,
  fields: [
    defineField({name: 'heading', title: 'Heading', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'body', title: 'Body', type: 'text', rows: 3}),
    defineField({name: 'primaryCta', title: 'Primary CTA', type: 'link'}),
    defineField({name: 'secondaryCta', title: 'Secondary CTA', type: 'link'}),
  ],
  preview: {
    select: {title: 'heading'},
    prepare: ({title}) => ({title: title || 'CTA', subtitle: 'CTA'}),
  },
})

export const homeCta = defineType({
  name: 'homeCta',
  title: 'CTA (localized)',
  type: 'object',
  icon: LaunchIcon,
  fields: [
    defineField({name: 'heading', title: 'Heading', type: 'localeString', validation: (r) => r.required()}),
    defineField({name: 'body', title: 'Body', type: 'localeText'}),
    defineField({name: 'primaryCta', title: 'Primary CTA', type: 'localeLink'}),
    defineField({name: 'secondaryCta', title: 'Secondary CTA', type: 'localeLink'}),
  ],
  preview: {
    select: {title: 'heading.en.value'},
    prepare: ({title}) => ({title: title || 'CTA', subtitle: 'CTA (localized)'}),
  },
})
