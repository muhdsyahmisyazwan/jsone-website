import {defineField, defineType} from 'sanity'

/** SEO for field-level documents (homepage / settings) - EN/MS/ZH side by side. */
export const localeSeo = defineType({
  name: 'localeSeo',
  title: 'SEO',
  type: 'object',
  fields: [
    defineField({
      name: 'metaTitle',
      title: 'Meta title',
      type: 'localeString',
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta description',
      type: 'localeText',
    }),
    defineField({
      name: 'ogImage',
      title: 'Open Graph image',
      type: 'localizedImage',
    }),
  ],
})

/** SEO for a single-language document (page / news translation). */
export const seo = defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  fields: [
    defineField({
      name: 'metaTitle',
      title: 'Meta title',
      type: 'string',
      validation: (rule) => rule.max(70).warning('Keep under ~60-70 characters'),
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta description',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.max(160).warning('Keep under ~155-160 characters'),
    }),
    defineField({
      name: 'ogImage',
      title: 'Open Graph image',
      type: 'contentImage',
    }),
  ],
})
