import {DocumentIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

const pageSections = [
  defineArrayMember({type: 'hero'}),
  defineArrayMember({type: 'textImage'}),
  defineArrayMember({type: 'servicesGrid'}),
  defineArrayMember({type: 'team'}),
  defineArrayMember({type: 'testimonials'}),
  defineArrayMember({type: 'cta'}),
  defineArrayMember({type: 'faq'}),
  defineArrayMember({type: 'contactForm'}),
  defineArrayMember({type: 'logoStrip'}),
]

/**
 * Marketing / content page - document-level translations via
 * @sanity/document-internationalization (one document per language).
 */
export const page = defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  icon: DocumentIcon,
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'seo', title: 'SEO'},
    {name: 'meta', title: 'Publishing'},
  ],
  fields: [
    defineField({
      name: 'language',
      type: 'string',
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'content',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'content',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'sections',
      title: 'Sections',
      type: 'array',
      group: 'content',
      of: pageSections,
      options: {insertMenu: {views: [{name: 'grid'}, {name: 'list'}]}},
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
      group: 'seo',
    }),
    defineField({
      name: 'reviewed',
      title: 'Reviewed for publish',
      type: 'boolean',
      group: 'meta',
      description:
        'Unreviewed translations must not appear on the live site. Check this only after linguistic/content review.',
      initialValue: false,
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      language: 'language',
      reviewed: 'reviewed',
      slug: 'slug.current',
    },
    prepare: ({title, language, reviewed, slug}) => ({
      title: title || 'Untitled page',
      subtitle: [language?.toUpperCase(), slug && `/${slug}`, reviewed ? 'Reviewed' : 'Needs review']
        .filter(Boolean)
        .join(' · '),
    }),
  },
})
