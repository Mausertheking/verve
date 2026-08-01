import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import az from './locales/az.json';
import ru from './locales/ru.json';
import en from './locales/en.json';

import type { Locale, LocalizedText, LocalizedList } from '@/types/content';

/**
 * UI chrome strings only. Lesson, drill and glossary text lives in /content
 * with all three languages inline — a glossary entry *is* a three-language
 * mapping, and splitting it across locale files would mean editing three files
 * to fix one sentence.
 */
void i18n.use(initReactI18next).init({
  resources: { az: { translation: az }, ru: { translation: ru }, en: { translation: en } },
  lng: 'az',
  fallbackLng: 'az',
  interpolation: { escapeValue: false },
  // No language detector: nothing inspects the device, and no network is used.
});

export default i18n;

/**
 * Picks a localised string, falling back to Azerbaijani when a translation is
 * missing or empty. Azerbaijani is required for all content; ru and en are
 * allowed to be blank so content can ship without waiting on translation.
 */
export function pick(value: LocalizedText | undefined, locale: Locale): string {
  if (!value) return '';
  const v = value[locale];
  return v && v.length > 0 ? v : value.az;
}

/** List form of `pick`. An empty array falls back the same way a blank string does. */
export function pickList(value: LocalizedList | undefined, locale: Locale): string[] {
  if (!value) return [];
  const v = value[locale];
  return v && v.length > 0 ? v : value.az;
}
