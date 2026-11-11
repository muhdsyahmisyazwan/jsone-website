import {EnvelopeIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export const contactForm = defineType({
  name: 'contactForm',
  title: 'Contact form',
  type: 'object',
  icon: EnvelopeIcon,
  fields: [
    defineField({name: 'heading', title: 'Heading', type: 'string'}),
    defineField({name: 'intro', title: 'Intro', type: 'text', rows: 3}),
    defineField({
      name: 'showPhone',
      title: 'Show phone field',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'showCompany',
      title: 'Show company field',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'successMessage',
      title: 'Success message override',
      type: 'string',
      description: 'Optional. Falls back to UI i18n strings.',
    }),
  ],
  preview: {
    select: {title: 'heading'},
    prepare: ({title}) => ({title: title || 'Contact form', subtitle: 'Contact form'}),
  },
})

export const homeContactForm = defineType({
  name: 'homeContactForm',
  title: 'Contact form (localized)',
  type: 'object',
  icon: EnvelopeIcon,
  fields: [
    defineField({name: 'heading', title: 'Heading', type: 'localeString'}),
    defineField({name: 'intro', title: 'Intro', type: 'localeText'}),
    defineField({name: 'showPhone', title: 'Show phone field', type: 'boolean', initialValue: true}),
    defineField({name: 'showCompany', title: 'Show company field', type: 'boolean', initialValue: true}),
    defineField({
      name: 'successMessage',
      title: 'Success message override',
      type: 'localeString',
    }),
  ],
  preview: {
    select: {title: 'heading.en.value'},
    prepare: ({title}) => ({title: title || 'Contact form', subtitle: 'Contact form (localized)'}),
  },
})
