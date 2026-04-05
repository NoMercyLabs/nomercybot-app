import { View, Text, ScrollView, TextInput } from 'react-native'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Users } from 'lucide-react-native'
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary'

interface AdminUser {
  id: string
  displayName: string
  login: string
  email: string | null
  role: 'user' | 'moderator' | 'admin'
  channelCount: number
  createdAt: string
  lastActive: string | null
}

export default function AdminUsersScreen() {
  const [search, setSearch] = useState('')

  const { data: users, isLoading } = useQuery<AdminUser[]>({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const res = await apiClient.get<{ data: AdminUser[] }>('/v1/admin/users')
      return res.data.data
    },
  })

  const filtered = users?.filter((u) =>
    !search || u.displayName.toLowerCase().includes(search.toLowerCase()) ||
    u.login.toLowerCase().includes(search.toLowerCase()),
  ) ?? []

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <ErrorBoundary>
    <ScrollView className="flex-1 bg-gray-950" contentContainerClassName="pb-8">
      <PageHeader
        title="Users"
        backHref="/(admin)"
        subtitle={!isLoading ? `${users?.length ?? 0} total` : undefined}
      />

      <View className="px-4 pt-4 gap-3">
        {/* Search */}
        <TextInput
          className="rounded-lg bg-surface-raised border border-border px-4 py-3 text-gray-100"
          placeholder="Search by name or username…"
          placeholderTextColor="rgb(107,114,128)"
          value={search}
          onChangeText={setSearch}
        />

        {isLoading ? (
          <Skeleton className="h-16 w-full" count={6} />
        ) : !filtered.length ? (
          <EmptyState
            icon={<Users size={40} color="rgb(107,114,128)" />}
            title={search ? 'No users match your search' : 'No users found'}
          />
        ) : (
          filtered.map((user) => (
            <Card key={user.id} className="px-4 py-3">
              <View className="flex-row items-start justify-between gap-3">
                <View className="flex-1 gap-0.5">
                  <View className="flex-row items-center gap-2 flex-wrap">
                    <Text className="text-sm font-semibold text-gray-100">{user.displayName}</Text>
                    {user.role !== 'user' && (
                      <Badge
                        variant={user.role === 'admin' ? 'warning' : 'info'}
                        label={user.role}
                      />
                    )}
                  </View>
                  <Text className="text-xs text-gray-500">@{user.login}</Text>
                  {user.email && <Text className="text-xs text-gray-600">{user.email}</Text>}
                  <View className="flex-row items-center gap-3 mt-0.5">
                    <Text className="text-xs text-gray-600">
                      {user.channelCount} channel{user.channelCount !== 1 ? 's' : ''}
                    </Text>
                    <Text className="text-xs text-gray-600">
                      Joined {formatDate(user.createdAt)}
                    </Text>
                  </View>
                </View>
                {user.lastActive && (
                  <Text className="text-xs text-gray-600 shrink-0">
                    {formatDate(user.lastActive)}
                  </Text>
                )}
              </View>
            </Card>
          ))
        )}
      </View>
    </ScrollView>
    </ErrorBoundary>
  )
}
