import {LinkIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export const link = defineType({
  name: 'link',
  title: 'Link',
  type: 'object',
  icon: LinkIcon,
  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'linkType',
      title: 'Link type',
      type: 'string',
      options: {
        list: [
          {title: 'Internal page', value: 'internal'},
          {title: 'News article', value: 'news'},
          {title: 'External URL', value: 'external'},
          {title: 'Email', value: 'email'},
          {title: 'Phone', value: 'phone'},
        ],
        layout: 'radio',
      },
      initialValue: 'internal',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'internalPath',
      title: 'Internal path',
      type: 'string',
      description: 'Path without locale prefix, e.g. /about/ or /solutions/',
      hidden: ({parent}) => parent?.linkType !== 'internal',
    }),
    defineField({
      name: 'page',
      title: 'Page',
      type: 'reference',
      to: [{type: 'page'}],
      hidden: ({parent}) => parent?.linkType !== 'internal',
    }),
    defineField({
      name: 'news',
      title: 'News article',
      type: 'reference',
      to: [{type: 'news'}],
      hidden: ({parent}) => parent?.linkType !== 'news',
    }),
    defineField({
      name: 'href',
      title: 'URL',
      type: 'url',
      validation: (rule) =>
        rule.uri({allowRelative: false, scheme: ['http', 'https', 'mailto', 'tel']}),
      hidden: ({parent}) => !['external', 'email', 'phone'].includes(parent?.linkType),
    }),
    defineField({
      name: 'openInNewTab',
      title: 'Open in new tab',
      type: 'boolean',
      initialValue: false,
      hidden: ({parent}) => parent?.linkType !== 'external',
    }),
  ],
  preview: {
    select: {title: 'label', subtitle: 'linkType'},
  },
})

/** Field-level localized link label + shared target. */
export const localeLink = defineType({
  name: 'localeLink',
  title: 'Localized link',
  type: 'object',
  icon: LinkIcon,
  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      type: 'localeString',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'linkType',
      title: 'Link type',
      type: 'string',
      options: {
        list: [
          {title: 'Internal path', value: 'internal'},
          {title: 'External URL', value: 'external'},
          {title: 'Email', value: 'email'},
          {title: 'Phone', value: 'phone'},
        ],
        layout: 'radio',
      },
      initialValue: 'internal',
    }),
    defineField({
      name: 'internalPath',
      title: 'Internal path',
      type: 'string',
      description: 'Path without locale prefix, e.g. /about/',
      hidden: ({parent}) => parent?.linkType !== 'internal',
    }),
    defineField({
      name: 'href',
      title: 'URL / mailto / tel',
      type: 'string',
      hidden: ({parent}) => !['external', 'email', 'phone'].includes(parent?.linkType),
    }),
    defineField({
      name: 'openInNewTab',
      title: 'Open in new tab',
      type: 'boolean',
      initialValue: false,
      hidden: ({parent}) => parent?.linkType !== 'external',
    }),
  ],
})
