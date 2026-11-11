import {MenuIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const navigation = defineType({
  name: 'navigation',
  title: 'Navigation',
  type: 'document',
  icon: MenuIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Internal title',
      type: 'string',
      initialValue: 'Main navigation',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'items',
      title: 'Menu items',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'navItem',
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
                ],
                layout: 'radio',
              },
              initialValue: 'internal',
            }),
            defineField({
              name: 'internalPath',
              title: 'Internal path',
              type: 'string',
              description: 'Without locale prefix, e.g. /about/ or /',
              hidden: ({parent}) => parent?.linkType !== 'internal',
            }),
            defineField({
              name: 'href',
              title: 'External URL',
              type: 'url',
              hidden: ({parent}) => parent?.linkType !== 'external',
            }),
            defineField({
              name: 'children',
              title: 'Dropdown children',
              type: 'array',
              of: [
                defineArrayMember({
                  type: 'object',
                  name: 'navChild',
                  fields: [
                    defineField({name: 'label', type: 'localeString', title: 'Label'}),
                    defineField({
                      name: 'internalPath',
                      type: 'string',
                      title: 'Internal path',
                      description: 'e.g. /about/ or /about/team/',
                    }),
                  ],
                  preview: {
                    select: {title: 'label.en.value', subtitle: 'internalPath'},
                    prepare: ({title, subtitle}) => ({
                      title: title || 'Child link',
                      subtitle,
                    }),
                  },
                }),
              ],
            }),
          ],
          preview: {
            select: {
              title: 'label.en.value',
              subtitle: 'internalPath',
              linkType: 'linkType',
            },
            prepare: ({title, subtitle, linkType}) => ({
              title: title || 'Nav item',
              subtitle: linkType === 'external' ? 'External' : subtitle || 'Internal',
            }),
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {title: 'title'},
  },
})
