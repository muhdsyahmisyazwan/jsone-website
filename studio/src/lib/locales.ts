export const locales = [
  {id: 'en', title: 'English', short: 'EN'},
  {id: 'ms', title: 'Bahasa Melayu', short: 'MS'},
  {id: 'zh', title: '简体中文', short: 'ZH'},
] as const

export type LocaleId = (typeof locales)[number]['id']

export const defaultLocale: LocaleId = 'en'

export const supportedLanguages = locales.map(({id, title}) => ({id, title}))
