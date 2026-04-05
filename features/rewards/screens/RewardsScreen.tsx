import { View, Text, ScrollView, Pressable, RefreshControl } from 'react-native'
import { router } from 'expo-router'
import { useApiQuery } from '@/hooks/useApi'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary'
import { Gift, ChevronRight, Plus } from 'lucide-react-native'

interface Reward {
  id: string
  title: string
  cost: number
  enabled: boolean
  isPaused: boolean
  redemptionCount: number
  cooldown: number | null
}

export function RewardsScreen() {
  const { data: rewards, isLoading, isRefetching, refetch } = useApiQuery<Reward[]>('rewards', '/rewards')

  const enabledCount = rewards?.filter((r) => r.enabled && !r.isPaused).length ?? 0
  const totalCount = rewards?.length ?? 0

  return (
    <ErrorBoundary>
    <View className="flex-1 bg-gray-950">
      <PageHeader
        title="Channel Rewards"
        subtitle={!isLoading ? `${enabledCount} / ${totalCount} active` : undefined}
        rightContent={
          <Button
            size="sm"
            label="Add Reward"
            leftIcon={<Plus size={14} color="white" />}
            onPress={() => router.push('/(dashboard)/rewards/new' as any)}
          />
        }
      />

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 py-4 gap-3 pb-8"
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      >
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))
        ) : !rewards?.length ? (
          <EmptyState
            icon={<Gift size={40} color="rgb(107,114,128)" />}
            title="No rewards yet"
            message="Create channel point rewards to let your viewers redeem them during streams."
            actionLabel="Create Reward"
            onAction={() => router.push('/(dashboard)/rewards/new' as any)}
          />
        ) : (
          rewards.map((reward) => (
            <Pressable
              key={reward.id}
              onPress={() => router.push(`/(dashboard)/rewards/${reward.id}` as any)}
            >
              <Card className="px-4 py-3">
                <View className="flex-row items-center gap-3">
                  <View className="flex-1 gap-1">
                    <View className="flex-row items-center gap-2 flex-wrap">
                      <Text className="text-sm font-semibold text-gray-100">{reward.title}</Text>
                      {reward.isPaused && <Badge variant="warning" label="Paused" />}
                      {!reward.enabled && <Badge variant="muted" label="Disabled" />}
                    </View>
                    <View className="flex-row items-center gap-3">
                      <Text className="text-sm font-bold text-yellow-400">
                        {reward.cost.toLocaleString()} pts
                      </Text>
                      <Text className="text-xs text-gray-500">
                        {reward.redemptionCount.toLocaleString()} redeemed
                      </Text>
                      {reward.cooldown != null && reward.cooldown > 0 && (
                        <Text className="text-xs text-gray-500">
                          {reward.cooldown}s cooldown
                        </Text>
                      )}
                    </View>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <Badge
                      variant={reward.enabled && !reward.isPaused ? 'success' : 'muted'}
                      label={reward.enabled && !reward.isPaused ? 'Active' : 'Inactive'}
                    />
                    <ChevronRight size={16} color="rgb(107,114,128)" />
                  </View>
                </View>
              </Card>
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
    </ErrorBoundary>
  )
}
