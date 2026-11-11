import type {StructureResolver} from 'sanity/structure'
import {
  CogIcon,
  DocumentIcon,
  HomeIcon,
  MenuIcon,
  BookIcon,
  StackCompactIcon,
} from '@sanity/icons'

const SINGLETONS = [
  {type: 'siteSettings', title: 'Site settings', icon: CogIcon},
  {type: 'navigation', title: 'Navigation', icon: MenuIcon},
  {type: 'footer', title: 'Footer', icon: StackCompactIcon},
  {type: 'homePage', title: 'Homepage', icon: HomeIcon},
] as const

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      ...SINGLETONS.map((item) =>
        S.listItem()
          .title(item.title)
          .icon(item.icon)
          .child(S.document().schemaType(item.type).documentId(item.type).title(item.title)),
      ),
      S.divider(),
      S.listItem()
        .title('Pages')
        .icon(DocumentIcon)
        .child(S.documentTypeList('page').title('Pages')),
      S.listItem()
        .title('News')
        .icon(BookIcon)
        .child(S.documentTypeList('news').title('News')),
    ])

/** Hide singleton types from the default “Create new” / type list clutter. */
export type SingletonType = (typeof SINGLETONS)[number]['type']

export const singletonTypes = new Set<string>(SINGLETONS.map((s) => s.type))

export const singletonActions = new Set<string>([
  'publish',
  'discardChanges',
  'restore',
  'unpublish',
])

export function isSingletonType(schemaType: string): boolean {
  return singletonTypes.has(schemaType)
}
