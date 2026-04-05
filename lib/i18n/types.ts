import type commonEn from '@/locales/en/common.json'
import type commandsEn from '@/locales/en/commands.json'
import type dashboardEn from '@/locales/en/dashboard.json'
import type pipelinesEn from '@/locales/en/pipelines.json'
import type moderationEn from '@/locales/en/moderation.json'
import type musicEn from '@/locales/en/music.json'
import type settingsEn from '@/locales/en/settings.json'

export type TranslationNamespace =
  | 'common'
  | 'dashboard'
  | 'commands'
  | 'pipelines'
  | 'moderation'
  | 'music'
  | 'settings'

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common'
    resources: {
      common: typeof commonEn
      commands: typeof commandsEn
      dashboard: typeof dashboardEn
      pipelines: typeof pipelinesEn
      moderation: typeof moderationEn
      music: typeof musicEn
      settings: typeof settingsEn
    }
  }
}
