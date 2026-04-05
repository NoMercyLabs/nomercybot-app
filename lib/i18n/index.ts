import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { getLocales } from 'expo-localization'

import commonEn from '@/locales/en/common.json'
import dashboardEn from '@/locales/en/dashboard.json'
import commandsEn from '@/locales/en/commands.json'
import pipelinesEn from '@/locales/en/pipelines.json'
import moderationEn from '@/locales/en/moderation.json'
import musicEn from '@/locales/en/music.json'
import settingsEn from '@/locales/en/settings.json'

export type SupportedLocale = 'en' | 'nl' | 'de'

const deviceLocale = getLocales()[0]?.languageCode ?? 'en'
const defaultLocale: SupportedLocale =
  (['en', 'nl', 'de'] as const).includes(deviceLocale as SupportedLocale)
    ? (deviceLocale as SupportedLocale)
    : 'en'

i18n.use(initReactI18next).init({
  lng: defaultLocale,
  fallbackLng: 'en',
  defaultNS: 'common',
  ns: ['common', 'dashboard', 'commands', 'pipelines', 'moderation', 'music', 'settings'],
  resources: {
    en: {
      common: commonEn,
      dashboard: dashboardEn,
      commands: commandsEn,
      pipelines: pipelinesEn,
      moderation: moderationEn,
      music: musicEn,
      settings: settingsEn,
    },
  },
  interpolation: { escapeValue: false },
  saveMissing: typeof __DEV__ !== 'undefined' && __DEV__,
  react: { useSuspense: false },
})

export default i18n
