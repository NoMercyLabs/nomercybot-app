import { View, Text, ScrollView } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Hash } from 'lucide-react-native'
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary'

interface AdminChannel {
  id: string
  displayName: string
  login: string
  isLive: boolean
  isActive: boolean
  viewerCount: number
  plan: string
  createdAt: string
}

export default function AdminChannelsScreen() {
  const { data: channels, isLoading } = useQuery<AdminChannel[]>({
    queryKey: ['admin', 'channels'],
    queryFn: async () => {
      const res = await apiClient.get<{ data: AdminChannel[] }>('/v1/admin/channels')
      return res.data.data
    },
  })

  return (
    <ErrorBoundary>
    <ScrollView className="flex-1 bg-gray-950" contentContainerClassName="pb-8">
      <PageHeader
        title="Channels"
        backHref="/(admin)"
        subtitle={!isLoading ? `${channels?.length ?? 0} total` : undefined}
      />

      <View className="px-4 pt-4 gap-3">
        {isLoading ? (
          <Skeleton className="h-16 w-full" count={6} />
        ) : !channels?.length ? (
          <EmptyState
            icon={<Hash size={40} color="rgb(107,114,128)" />}
            title="No channels"
            message="No channels have been registered yet."
          />
        ) : (
          channels.map((ch) => (
            <Card key={ch.id} className="px-4 py-3">
              <View className="flex-row items-center justify-between gap-3">
                <View className="flex-1 gap-0.5">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-sm font-semibold text-gray-100">{ch.displayName}</Text>
                    {ch.isLive && <Badge variant="danger" label="LIVE" />}
                  </View>
                  <View className="flex-row items-center gap-3">
                    <Text className="text-xs text-gray-500">@{ch.login}</Text>
                    <Text className="text-xs text-gray-500">Plan: {ch.plan}</Text>
                    {ch.isLive && (
                      <Text className="text-xs text-gray-500">
                        {ch.viewerCount.toLocaleString()} viewers
                      </Text>
                    )}
                  </View>
                </View>
                <Badge
                  variant={ch.isActive ? 'success' : 'muted'}
                  label={ch.isActive ? 'Active' : 'Inactive'}
                />
              </View>
            </Card>
          ))
        )}
      </View>
    </ScrollView>
    </ErrorBoundary>
  )
}
