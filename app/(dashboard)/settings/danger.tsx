import { ScrollView, View, Text, Alert } from 'react-native'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary'
import { AlertTriangle } from 'lucide-react-native'
import { useAuthStore } from '@/stores/useAuthStore'
import { useMutation } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { useAuth } from '@/hooks/useAuth'

export default function DangerZoneScreen() {
  const logout = useAuthStore((s) => s.logout)
  const { user } = useAuth()

  const resetMutation = useMutation({
    mutationFn: () => apiClient.post(`/v1/channels/reset`),
    onSuccess: () => Alert.alert('Reset Complete', 'Bot configuration has been reset.'),
    onError: () => Alert.alert('Error', 'Failed to reset bot configuration.'),
  })

  const deleteMutation = useMutation({
    mutationFn: () => apiClient.delete(`/v1/users/${user!.id}`),
    onSuccess: () => { logout() },
    onError: () => Alert.alert('Error', 'Failed to delete account.'),
  })

  function confirmReset() {
    Alert.alert(
      'Reset Bot Configuration',
      'This will reset all bot settings to defaults. Commands, timers, and responses will be preserved.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: () => resetMutation.mutate() },
      ],
    )
  }

  function confirmDelete() {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all associated data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate() },
      ],
    )
  }

  return (
    <ErrorBoundary>
      <ScrollView
        style={{ flex: 1, backgroundColor: '#141125' }}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <PageHeader title="Danger Zone" />

        <View className="px-5 pt-4 gap-4">
          <View
            className="rounded-xl p-4 gap-4"
            style={{
              backgroundColor: 'rgba(239,68,68,0.05)',
              borderWidth: 1,
              borderColor: 'rgba(239,68,68,0.3)',
            }}
          >
            <View className="flex-row items-center gap-2">
              <AlertTriangle size={16} color="#ef4444" />
              <Text className="text-sm font-semibold" style={{ color: '#ef4444' }}>Destructive Actions</Text>
            </View>
            <Text className="text-xs" style={{ color: '#8889a0' }}>
              These actions are irreversible. Please proceed with caution.
            </Text>

            <View style={{ borderTopWidth: 1, borderTopColor: 'rgba(239,68,68,0.2)', paddingTop: 16, gap: 12 }}>
              <View className="gap-2">
                <Text className="text-sm font-medium text-white">Reset Bot Configuration</Text>
                <Text className="text-xs" style={{ color: '#5a5280' }}>
                  Reset all bot settings to their default values. Your commands, timers, and automations will be preserved.
                </Text>
                <Button
                  variant="outline"
                  label="Reset Bot Configuration"
                  loading={resetMutation.isPending}
                  onPress={confirmReset}
                />
              </View>

              <View
                className="gap-2"
                style={{ borderTopWidth: 1, borderTopColor: 'rgba(239,68,68,0.2)', paddingTop: 12 }}
              >
                <Text className="text-sm font-medium" style={{ color: '#ef4444' }}>Delete Account</Text>
                <Text className="text-xs" style={{ color: '#5a5280' }}>
                  Permanently delete your account and all associated data. This cannot be undone.
                </Text>
                <Button
                  variant="danger"
                  label="Delete Account"
                  loading={deleteMutation.isPending}
                  onPress={confirmDelete}
                />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ErrorBoundary>
  )
}
