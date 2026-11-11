import {HelpCircleIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const faq = defineType({
  name: 'faq',
  title: 'FAQ',
  type: 'object',
  icon: HelpCircleIcon,
  fields: [
    defineField({name: 'heading', title: 'Heading', type: 'string'}),
    defineField({name: 'intro', title: 'Intro', type: 'text', rows: 2}),
    defineField({
      name: 'items',
      title: 'Questions',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'faqItem',
          fields: [
            defineField({name: 'question', type: 'string', title: 'Question', validation: (r) => r.required()}),
            defineField({name: 'answer', type: 'blockContent', title: 'Answer'}),
          ],
          preview: {select: {title: 'question'}},
        }),
      ],
    }),
  ],
  preview: {
    select: {title: 'heading'},
    prepare: ({title}) => ({title: title || 'FAQ', subtitle: 'FAQ'}),
  },
})

export const homeFaq = defineType({
  name: 'homeFaq',
  title: 'FAQ (localized)',
  type: 'object',
  icon: HelpCircleIcon,
  fields: [
    defineField({name: 'heading', title: 'Heading', type: 'localeString'}),
    defineField({name: 'intro', title: 'Intro', type: 'localeText'}),
    defineField({
      name: 'items',
      title: 'Questions',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'homeFaqItem',
          fields: [
            defineField({name: 'question', type: 'localeString', title: 'Question'}),
            defineField({name: 'answer', type: 'localeBlockContent', title: 'Answer'}),
          ],
          preview: {
            select: {title: 'question.en.value'},
            prepare: ({title}) => ({title: title || 'Question'}),
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {title: 'heading.en.value'},
    prepare: ({title}) => ({title: title || 'FAQ', subtitle: 'FAQ (localized)'}),
  },
})
