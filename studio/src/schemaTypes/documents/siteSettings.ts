import {CogIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  icon: CogIcon,
  groups: [
    {name: 'brand', title: 'Brand', default: true},
    {name: 'contact', title: 'Contact'},
    {name: 'social', title: 'Social'},
    {name: 'seo', title: 'Default SEO'},
  ],
  fields: [
    defineField({
      name: 'siteName',
      title: 'Site name',
      type: 'localeString',
      group: 'brand',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'legalName',
      title: 'Legal name',
      type: 'string',
      group: 'brand',
      description: 'e.g. J. S. One Sdn Bhd',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'localeString',
      group: 'brand',
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'localizedImage',
      group: 'brand',
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      group: 'contact',
      validation: (rule) => rule.email(),
    }),
    defineField({
      name: 'phone',
      title: 'Phone',
      type: 'string',
      group: 'contact',
    }),
    defineField({
      name: 'address',
      title: 'Address',
      type: 'localeText',
      group: 'contact',
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social links',
      type: 'array',
      group: 'social',
      of: [
        {
          type: 'object',
          name: 'socialLink',
          fields: [
            defineField({
              name: 'platform',
              type: 'string',
              title: 'Platform',
              options: {
                list: ['LinkedIn', 'Facebook', 'X', 'YouTube', 'Instagram', 'Other'],
              },
            }),
            defineField({name: 'url', type: 'url', title: 'URL'}),
            defineField({name: 'label', type: 'localeString', title: 'Accessible label'}),
          ],
          preview: {select: {title: 'platform', subtitle: 'url'}},
        },
      ],
    }),
    defineField({
      name: 'defaultSeo',
      title: 'Default SEO',
      type: 'localeSeo',
      group: 'seo',
    }),
  ],
  preview: {
    prepare: () => ({title: 'Site settings'}),
  },
})
