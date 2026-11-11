import en from './en.json';
import ms from './ms.json';
import zh from './zh.json';
import { defaultLocale, type Locale, isLocale } from './locales';

type Dictionary = typeof en;

const dictionaries: Record<Locale, Dictionary> = {
  en,
  ms: ms as Dictionary,
  zh: zh as Dictionary,
};

type NestedKeyOf<T, Prefix extends string = ''> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object
        ? NestedKeyOf<T[K], Prefix extends '' ? K : `${Prefix}.${K}`>
        : Prefix extends ''
          ? K
          : `${Prefix}.${K}`;
    }[keyof T & string]
  : never;

export type TranslationKey = NestedKeyOf<Dictionary>;

function getByPath(obj: unknown, path: string): string | undefined {
  const value = path.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object' && part in acc) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj);

  return typeof value === 'string' ? value : undefined;
}

/**
 * Look up a UI string. Falls back to English when the key is missing
 * for the requested locale.
 */
export function t(locale: string, key: TranslationKey | string): string {
  const lang: Locale = isLocale(locale) ? locale : defaultLocale;
  const fromLocale = getByPath(dictionaries[lang], key);
  if (fromLocale !== undefined) return fromLocale;

  const fromDefault = getByPath(dictionaries[defaultLocale], key);
  if (fromDefault !== undefined) return fromDefault;

  if (import.meta.env.DEV) {
    console.warn(`[i18n] Missing key "${key}" for locale "${lang}"`);
  }
  return key;
}

export function getDictionary(locale: string): Dictionary {
  const lang: Locale = isLocale(locale) ? locale : defaultLocale;
  return dictionaries[lang];
}
