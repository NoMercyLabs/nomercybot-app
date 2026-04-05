import { View, Text, ScrollView, RefreshControl } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { useChannelStore } from '@/stores/useChannelStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { ShieldCheck, ShieldAlert, Lock } from 'lucide-react-native'
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary'

interface Permission {
  scope: string
  name: string
  description: string
  category: string
  granted: boolean
  required: boolean
}

interface PermissionsResponse {
  permissions: Permission[]
  grantedCount: number
  totalCount: number
}

function PermissionRow({ permission, onGrant, isGranting }: {
  permission: Permission
  onGrant: (scope: string) => void
  isGranting: boolean
}) {
  return (
    <View className="flex-row items-start justify-between gap-3 py-3 border-b border-border last:border-b-0">
      <View className="flex-row items-start gap-3 flex-1">
        <View className="mt-0.5">
          {permission.granted
            ? <ShieldCheck size={16} color="rgb(74,222,128)" />
            : <ShieldAlert size={16} color="rgb(251,191,36)" />
          }
        </View>
        <View className="flex-1 gap-0.5">
          <View className="flex-row items-center gap-2 flex-wrap">
            <Text className="text-sm font-medium text-gray-100">{permission.name}</Text>
            {permission.required && (
              <Badge variant="warning" label="Required" />
            )}
          </View>
          <Text className="text-xs text-gray-500">{permission.description}</Text>
          <Text className="text-xs text-gray-600 font-mono mt-0.5">{permission.scope}</Text>
        </View>
      </View>
      {permission.granted ? (
        <Badge variant="success" label="Granted" />
      ) : (
        <Button
          size="sm"
          variant="outline"
          label="Grant"
          loading={isGranting}
          onPress={() => onGrant(permission.scope)}
        />
      )}
    </View>
  )
}

export function PermissionsScreen() {
  const channelId = useChannelStore((s) => s.currentChannel?.id)
  const requestScopeUpgrade = useAuthStore((s) => s.requestScopeUpgrade)
  const pendingScopeUpgrade = useAuthStore((s) => s.pendingScopeUpgrade)

  const { data, isLoading, isRefetching, refetch } = useQuery<PermissionsResponse>({
    queryKey: ['permissions', channelId],
    queryFn: async () => {
      const res = await apiClient.get<{ data: PermissionsResponse }>(
        `/v1/channels/${channelId}/permissions`,
      )
      return res.data.data
    },
    enabled: !!channelId,
  })

  function handleGrant(scope: string) {
    requestScopeUpgrade([scope])
  }

  const grouped = data?.permissions.reduce<Record<string, Permission[]>>((acc, p) => {
    if (!acc[p.category]) acc[p.category] = []
    acc[p.category].push(p)
    return acc
  }, {}) ?? {}

  const grantedCount = data?.grantedCount ?? 0
  const totalCount = data?.totalCount ?? 0

  return (
    <ErrorBoundary>
    <ScrollView className="flex-1 bg-gray-950" contentContainerClassName="pb-8" refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}>
      <PageHeader
        title="Permissions"
        subtitle={!isLoading ? `${grantedCount} / ${totalCount} granted` : undefined}
      />

      <View className="px-4 pt-4 gap-4">
        {isLoading ? (
          <Skeleton className="h-24 w-full" count={4} />
        ) : !data?.permissions.length ? (
          <EmptyState
            icon={<Lock size={40} color="rgb(107,114,128)" />}
            title="No permissions found"
            message="Permission data could not be loaded."
          />
        ) : (
          <>
            {/* Summary card */}
            <Card className="px-4 py-4 flex-row items-center gap-4">
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-100">OAuth Scopes</Text>
                <Text className="text-sm text-gray-400 mt-0.5">
                  {grantedCount === totalCount
                    ? 'All permissions are granted'
                    : `${totalCount - grantedCount} permission${totalCount - grantedCount !== 1 ? 's' : ''} missing`}
                </Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-gray-100">{grantedCount}</Text>
                <Text className="text-xs text-gray-500">of {totalCount}</Text>
              </View>
            </Card>

            {pendingScopeUpgrade && pendingScopeUpgrade.length > 0 && (
              <Card className="px-4 py-3 border border-amber-800 bg-amber-950">
                <Text className="text-sm font-medium text-amber-300">Scope upgrade pending</Text>
                <Text className="text-xs text-amber-500 mt-1">
                  A re-authentication will be required to grant:{' '}
                  {pendingScopeUpgrade.join(', ')}
                </Text>
              </Card>
            )}

            {Object.entries(grouped).map(([category, perms]) => (
              <Card key={category}>
                <CardHeader title={category} />
                <View className="px-4">
                  {perms.map((p) => (
                    <PermissionRow
                      key={p.scope}
                      permission={p}
                      onGrant={handleGrant}
                      isGranting={pendingScopeUpgrade?.includes(p.scope) ?? false}
                    />
                  ))}
                </View>
              </Card>
            ))}
          </>
        )}
      </View>
    </ScrollView>
    </ErrorBoundary>
  )
}
