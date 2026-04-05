import { View, Text, ScrollView, RefreshControl } from 'react-native'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PageHeader } from '@/components/layout/PageHeader'
import { Toggle } from '@/components/ui/Toggle'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary'
import { useChannelStore } from '@/stores/useChannelStore'
import { useToast } from '@/hooks/useToast'
import { apiClient } from '@/lib/api/client'
import type { ChatSettings } from '@/features/chat/types'

const DEFAULT: ChatSettings = {
  slowMode: false,
  slowModeDelay: 3,
  subscriberOnly: false,
  emotesOnly: false,
  followersOnly: false,
  followersOnlyDuration: 0,
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View
      className="rounded-xl overflow-hidden"
      style={{ backgroundColor: '#1A1530', borderWidth: 1, borderColor: '#1e1a35' }}
    >
      <View
        className="px-4 py-3"
        style={{ backgroundColor: '#231D42', borderBottomWidth: 1, borderBottomColor: '#1e1a35' }}
      >
        <Text className="text-sm font-semibold text-white">{title}</Text>
      </View>
      <View className="px-4">{children}</View>
    </View>
  )
}

function SettingRow({ label, description, control }: { label: string; description?: string; control: React.ReactNode }) {
  return (
    <View
      className="flex-row items-center justify-between py-4"
      style={{ borderBottomWidth: 1, borderBottomColor: '#1e1a35' }}
    >
      <View className="flex-1 mr-4 gap-0.5">
        <Text className="text-sm font-medium text-white">{label}</Text>
        {description && <Text className="text-xs" style={{ color: '#5a5280' }}>{description}</Text>}
      </View>
      {control}
    </View>
  )
}

export default function ChatSettingsScreen() {
  const broadcasterId = useChannelStore((s) => s.currentChannel?.broadcasterId)
  const toast = useToast()
  const qc = useQueryClient()

  const { data: settings = DEFAULT, isLoading, isRefetching, refetch } = useQuery<ChatSettings>({
    queryKey: ['chat', 'settings', broadcasterId],
    queryFn: () =>
      apiClient.get(`/api/${broadcasterId}/chat/settings`).then((r) => r.data),
    enabled: !!broadcasterId,
  })

  const mutation = useMutation({
    mutationFn: (patch: Partial<ChatSettings>) =>
      apiClient.patch(`/api/${broadcasterId}/chat/settings`, patch).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['chat', 'settings', broadcasterId] })
      toast.success('Saved')
    },
    onError: () => toast.error('Failed to save'),
  })

  function patch(key: keyof ChatSettings, value: unknown) {
    mutation.mutate({ [key]: value } as Partial<ChatSettings>)
  }

  return (
    <ErrorBoundary>
      <ScrollView
        style={{ flex: 1, backgroundColor: '#141125' }}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      >
        <PageHeader title="Chat Settings" showBack />

        <View className="px-5 pt-4 gap-4">
          {isLoading ? (
            <View className="gap-3">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
            </View>
          ) : (
            <SectionCard title="Chat Modes">
              <SettingRow
                label="Slow Mode"
                description="Limit how often any user can send messages"
                control={<Toggle value={settings.slowMode} onValueChange={(v) => patch('slowMode', v)} />}
              />
              {settings.slowMode && (
                <View className="py-3" style={{ borderBottomWidth: 1, borderBottomColor: '#1e1a35' }}>
                  <Input
                    label="Delay (seconds)"
                    value={String(settings.slowModeDelay)}
                    onChangeText={(v) => patch('slowModeDelay', parseInt(v, 10) || 3)}
                    keyboardType="numeric"
                  />
                </View>
              )}
              <SettingRow
                label="Subscriber Only"
                description="Only subscribers can send messages"
                control={<Toggle value={settings.subscriberOnly} onValueChange={(v) => patch('subscriberOnly', v)} />}
              />
              <SettingRow
                label="Emote Only"
                description="Only emotes are allowed in chat"
                control={<Toggle value={settings.emotesOnly} onValueChange={(v) => patch('emotesOnly', v)} />}
              />
              <SettingRow
                label="Followers Only"
                description="Only followers can send messages"
                control={<Toggle value={settings.followersOnly} onValueChange={(v) => patch('followersOnly', v)} />}
              />
              {settings.followersOnly && (
                <View className="py-3">
                  <Input
                    label="Minimum follow time (minutes)"
                    value={String(settings.followersOnlyDuration)}
                    onChangeText={(v) => patch('followersOnlyDuration', parseInt(v, 10) || 0)}
                    keyboardType="numeric"
                  />
                </View>
              )}
            </SectionCard>
          )}
        </View>
      </ScrollView>
    </ErrorBoundary>
  )
}
