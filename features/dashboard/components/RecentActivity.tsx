import { View, Text, FlatList } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { Card, CardHeader } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { useChannelStore } from '@/stores/useChannelStore'
import { formatDistanceToNow } from 'date-fns'

export function RecentActivity() {
  const broadcasterId = useChannelStore((s) => s.currentChannel?.broadcasterId)

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'activity', broadcasterId],
    queryFn: () => apiClient.get(`/api/dashboard/${broadcasterId}/activity`).then((r) => r.data),
    enabled: !!broadcasterId,
  })

  return (
    <Card>
      <CardHeader>
        <Text className="text-base font-semibold text-white">Recent Activity</Text>
      </CardHeader>
      {isLoading ? (
        <Skeleton className="h-12 w-full" count={5} />
      ) : (
        <FlatList
          data={data?.items ?? []}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          ListEmptyComponent={
            <Text className="text-sm py-4 text-center" style={{ color: '#8889a0' }}>No recent activity</Text>
          }
          renderItem={({ item }) => (
            <View className="flex-row items-center gap-3 py-2.5 border-b" style={{ borderColor: '#1e1a35' }}>
              <View className="flex-1">
                <Text className="text-sm text-white">{item.message}</Text>
              </View>
              <Text className="text-xs" style={{ color: '#5a5280' }}>
                {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
              </Text>
            </View>
          )}
        />
      )}
    </Card>
  )
}
