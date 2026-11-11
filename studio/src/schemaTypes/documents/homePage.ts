import {HomeIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

const homeSections = [
  defineArrayMember({type: 'homeHero'}),
  defineArrayMember({type: 'homeTextImage'}),
  defineArrayMember({type: 'homeServicesGrid'}),
  defineArrayMember({type: 'homeTeam'}),
  defineArrayMember({type: 'homeTestimonials'}),
  defineArrayMember({type: 'homeCta'}),
  defineArrayMember({type: 'homeFaq'}),
  defineArrayMember({type: 'homeContactForm'}),
  defineArrayMember({type: 'homeLogoStrip'}),
]

/**
 * Homepage singleton - field-level EN / MS / ZH translations inside each section.
 */
export const homePage = defineType({
  name: 'homePage',
  title: 'Homepage',
  type: 'document',
  icon: HomeIcon,
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Internal title',
      type: 'string',
      initialValue: 'Homepage',
      validation: (rule) => rule.required(),
      group: 'content',
    }),
    defineField({
      name: 'sections',
      title: 'Sections',
      type: 'array',
      group: 'content',
      of: homeSections,
      options: {insertMenu: {views: [{name: 'grid'}, {name: 'list'}]}},
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'localeSeo',
      group: 'seo',
    }),
  ],
  preview: {
    prepare: () => ({title: 'Homepage'}),
  },
})
