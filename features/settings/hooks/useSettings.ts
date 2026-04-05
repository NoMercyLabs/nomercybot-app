import { useApiQuery, useApiMutation } from '@/hooks/useApi'
import type { BotSettings } from '../types'

export function useSettings() {
  const query = useApiQuery<BotSettings>('settings', '/settings')
  const updateMutation = useApiMutation<BotSettings, Partial<BotSettings>>('/settings', 'put', {
    invalidateKeys: ['settings'],
    successMessage: 'Settings saved',
  })

  return {
    settings: query.data,
    isLoading: query.isLoading,
    updateSettings: updateMutation.mutateAsync,
    isSaving: updateMutation.isPending,
  }
}
