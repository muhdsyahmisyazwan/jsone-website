import {BookIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

/**
 * News / insights article - document-level translations.
 */
export const news = defineType({
  name: 'news',
  title: 'News',
  type: 'document',
  icon: BookIcon,
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
      options: {source: 'title', maxLength: 96},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
      group: 'content',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
      group: 'meta',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'mainImage',
      title: 'Main image',
      type: 'contentImage',
      group: 'content',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'blockContent',
      group: 'content',
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
  orderings: [
    {
      title: 'Publish date, newest',
      name: 'publishedAtDesc',
      by: [{field: 'publishedAt', direction: 'desc'}],
    },
  ],
  preview: {
    select: {
      title: 'title',
      language: 'language',
      reviewed: 'reviewed',
      media: 'mainImage',
      date: 'publishedAt',
    },
    prepare: ({title, language, reviewed, media, date}) => ({
      title: title || 'Untitled article',
      subtitle: [
        language?.toUpperCase(),
        date && new Date(date).toLocaleDateString(),
        reviewed ? 'Reviewed' : 'Needs review',
      ]
        .filter(Boolean)
        .join(' · '),
      media,
    }),
  },
})
