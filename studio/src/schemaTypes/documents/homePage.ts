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
    {name: 'meta', title: 'Publishing'},
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
    defineField({
      name: 'reviewed',
      title: 'Reviewed for publish',
      type: 'boolean',
      group: 'meta',
      description:
        'Ship gate for the homepage. Unreviewed or missing flag falls back to the built-in homepage until checked. Also required before Publish.',
      initialValue: false,
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {reviewed: 'reviewed'},
    prepare: ({reviewed}) => ({
      title: 'Homepage',
      subtitle: reviewed ? 'Reviewed' : 'Not reviewed — will not replace fallback on live site',
    }),
  },
})
