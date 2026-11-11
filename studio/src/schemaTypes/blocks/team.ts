import {UsersIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const team = defineType({
  name: 'team',
  title: 'Team',
  type: 'object',
  icon: UsersIcon,
  fields: [
    defineField({name: 'heading', title: 'Heading', type: 'string'}),
    defineField({name: 'intro', title: 'Intro', type: 'text', rows: 3}),
    defineField({
      name: 'groups',
      title: 'Groups',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'teamGroup',
          fields: [
            defineField({name: 'title', type: 'string', title: 'Group title', validation: (r) => r.required()}),
            defineField({
              name: 'members',
              title: 'Members',
              type: 'array',
              of: [
                defineArrayMember({
                  type: 'object',
                  name: 'teamMember',
                  fields: [
                    defineField({name: 'name', type: 'string', title: 'Name', validation: (r) => r.required()}),
                    defineField({name: 'role', type: 'string', title: 'Role'}),
                    defineField({name: 'bio', type: 'text', title: 'Bio', rows: 3}),
                    defineField({name: 'photo', type: 'contentImage', title: 'Photo'}),
                  ],
                  preview: {
                    select: {title: 'name', subtitle: 'role', media: 'photo'},
                  },
                }),
              ],
            }),
          ],
          preview: {select: {title: 'title'}},
        }),
      ],
    }),
  ],
  preview: {
    select: {title: 'heading'},
    prepare: ({title}) => ({title: title || 'Team', subtitle: 'Team'}),
  },
})

export const homeTeam = defineType({
  name: 'homeTeam',
  title: 'Team (localized)',
  type: 'object',
  icon: UsersIcon,
  fields: [
    defineField({name: 'heading', title: 'Heading', type: 'localeString'}),
    defineField({name: 'intro', title: 'Intro', type: 'localeText'}),
    defineField({
      name: 'groups',
      title: 'Groups',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'homeTeamGroup',
          fields: [
            defineField({name: 'title', type: 'localeString', title: 'Group title'}),
            defineField({
              name: 'members',
              title: 'Members',
              type: 'array',
              of: [
                defineArrayMember({
                  type: 'object',
                  name: 'homeTeamMember',
                  fields: [
                    defineField({name: 'name', type: 'string', title: 'Name', validation: (r) => r.required()}),
                    defineField({name: 'role', type: 'localeString', title: 'Role'}),
                    defineField({name: 'bio', type: 'localeText', title: 'Bio'}),
                    defineField({name: 'photo', type: 'localizedImage', title: 'Photo'}),
                  ],
                  preview: {select: {title: 'name', media: 'photo'}},
                }),
              ],
            }),
          ],
          preview: {
            select: {title: 'title.en.value'},
            prepare: ({title}) => ({title: title || 'Group'}),
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {title: 'heading.en.value'},
    prepare: ({title}) => ({title: title || 'Team', subtitle: 'Team (localized)'}),
  },
})
