import { View, Text, ScrollView, RefreshControl } from 'react-native'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as WebBrowser from 'expo-web-browser'
import { apiClient } from '@/lib/api/client'
import { useChannelStore } from '@/stores/useChannelStore'
import { useNotificationStore } from '@/stores/useNotificationStore'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Puzzle, Link, Link2Off } from 'lucide-react-native'
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary'

interface Integration {
  id: string
  name: string
  description: string
  connected: boolean
  connectedAs?: string
  oauthUrl?: string
  category: string
}

interface IntegrationsResponse {
  integrations: Integration[]
}

const INTEGRATION_META: Record<string, { category: string; description: string }> = {
  spotify: { category: 'Music', description: 'Now playing overlays and song request commands' },
  discord: { category: 'Social', description: 'Cross-post alerts and notifications to Discord' },
  youtube: { category: 'Video', description: 'YouTube live stream management and stats' },
  obs: { category: 'Streaming', description: 'Scene switching, sources, and OBS remote control' },
  twitch: { category: 'Platform', description: 'Primary Twitch account — always connected' },
}

function IntegrationCard({
  integration,
  onConnect,
  onDisconnect,
  isLoading,
}: {
  integration: Integration
  onConnect: (id: string, oauthUrl?: string) => void
  onDisconnect: (id: string) => void
  isLoading: boolean
}) {
  const meta = INTEGRATION_META[integration.id.toLowerCase()] ?? {
    category: integration.category,
    description: integration.description,
  }

  const isPrimary = integration.id.toLowerCase() === 'twitch'

  return (
    <Card>
      <View className="px-4 py-4 flex-row items-center gap-3">
        <View className="w-10 h-10 rounded-lg bg-surface-overlay items-center justify-center">
          <Puzzle size={20} color="rgb(139,92,246)" />
        </View>
        <View className="flex-1 gap-0.5">
          <View className="flex-row items-center gap-2">
            <Text className="text-sm font-semibold text-gray-100">{integration.name}</Text>
            <Badge variant="secondary" label={meta.category} />
          </View>
          <Text className="text-xs text-gray-500">{meta.description}</Text>
          {integration.connected && integration.connectedAs && (
            <Text className="text-xs text-green-400 mt-0.5">Connected as {integration.connectedAs}</Text>
          )}
        </View>
        {isPrimary ? (
          <Badge variant="success" label="Connected" />
        ) : integration.connected ? (
          <Button
            size="sm"
            variant="ghost"
            label="Disconnect"
            leftIcon={<Link2Off size={12} color="rgb(248,113,113)" />}
            loading={isLoading}
            onPress={() => onDisconnect(integration.id)}
          />
        ) : (
          <Button
            size="sm"
            variant="outline"
            label="Connect"
            leftIcon={<Link size={12} color="rgb(209,213,219)" />}
            loading={isLoading}
            onPress={() => onConnect(integration.id, integration.oauthUrl)}
          />
        )}
      </View>
    </Card>
  )
}

export function IntegrationsScreen() {
  const channelId = useChannelStore((s) => s.currentChannel?.id)
  const addToast = useNotificationStore((s) => s.addToast)
  const queryClient = useQueryClient()

  const { data, isLoading, isRefetching, refetch } = useQuery<IntegrationsResponse>({
    queryKey: ['integrations', channelId],
    queryFn: async () => {
      const res = await apiClient.get<{ data: IntegrationsResponse }>(
        `/v1/channels/${channelId}/integrations`,
      )
      return res.data.data
    },
    enabled: !!channelId,
  })

  const disconnectMutation = useMutation<void, Error, string>({
    mutationFn: async (integrationId) => {
      await apiClient.delete(`/v1/channels/${channelId}/integrations/${integrationId}`)
    },
    onSuccess: () => {
      addToast('success', 'Integration disconnected')
      queryClient.invalidateQueries({ queryKey: ['integrations', channelId] })
    },
    onError: () => {
      addToast('error', 'Failed to disconnect integration')
    },
  })

  async function handleConnect(integrationId: string, oauthUrl?: string) {
    if (!oauthUrl) {
      const res = await apiClient.get<{ data: { oauthUrl: string } }>(
        `/v1/channels/${channelId}/integrations/${integrationId}/connect`,
      )
      oauthUrl = res.data.data.oauthUrl
    }
    if (oauthUrl) {
      await WebBrowser.openBrowserAsync(oauthUrl)
      queryClient.invalidateQueries({ queryKey: ['integrations', channelId] })
    }
  }

  const connectedCount = data?.integrations.filter((i) => i.connected).length ?? 0

  return (
    <ErrorBoundary>
    <ScrollView className="flex-1 bg-gray-950" contentContainerClassName="pb-8" refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}>
      <PageHeader
        title="Integrations"
        subtitle={!isLoading ? `${connectedCount} connected` : undefined}
      />

      <View className="px-4 pt-4 gap-4">
        {isLoading ? (
          <Skeleton className="h-20 w-full" count={4} />
        ) : !data?.integrations.length ? (
          <EmptyState
            icon={<Puzzle size={40} color="rgb(107,114,128)" />}
            title="No integrations available"
            message="Integrations will appear here once configured."
          />
        ) : (
          <>
            {/* Connected */}
            {data.integrations.filter((i) => i.connected).length > 0 && (
              <View className="gap-3">
                <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-1">
                  Connected
                </Text>
                {data.integrations
                  .filter((i) => i.connected)
                  .map((integration) => (
                    <IntegrationCard
                      key={integration.id}
                      integration={integration}
                      onConnect={handleConnect}
                      onDisconnect={(id) => disconnectMutation.mutate(id)}
                      isLoading={disconnectMutation.isPending && disconnectMutation.variables === integration.id}
                    />
                  ))}
              </View>
            )}

            {/* Available */}
            {data.integrations.filter((i) => !i.connected).length > 0 && (
              <View className="gap-3">
                <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-1">
                  Available
                </Text>
                {data.integrations
                  .filter((i) => !i.connected)
                  .map((integration) => (
                    <IntegrationCard
                      key={integration.id}
                      integration={integration}
                      onConnect={handleConnect}
                      onDisconnect={(id) => disconnectMutation.mutate(id)}
                      isLoading={false}
                    />
                  ))}
              </View>
            )}
          </>
        )}
      </View>
    </ScrollView>
    </ErrorBoundary>
  )
}
