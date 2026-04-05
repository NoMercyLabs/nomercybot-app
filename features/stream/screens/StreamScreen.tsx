import { useState } from 'react'
import { View, Text, ScrollView, Alert, RefreshControl } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { useChannelStore } from '@/stores/useChannelStore'
import { useApiMutation } from '@/hooks/useApi'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary'
import {
  Radio,
  Eye,
  Clock,
  Activity,
  Film,
  Zap,
  Edit2,
} from 'lucide-react-native'

interface StreamInfo {
  isLive: boolean
  title: string
  gameName: string
  gameId: string
  viewerCount: number
  followerCount: number
  uptime: number | null // seconds
  bitrate: number | null // kbps
  fps: number | null
  thumbnailUrl: string | null
}

function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

function StatRow({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <View className="flex-row items-center justify-between py-2 border-b border-border last:border-b-0">
      <View className="flex-row items-center gap-2">
        {icon && <View className="opacity-60">{icon}</View>}
        <Text className="text-sm text-gray-400">{label}</Text>
      </View>
      <Text className="text-sm font-medium text-gray-100">{value}</Text>
    </View>
  )
}

export function StreamScreen() {
  const channelId = useChannelStore((s) => s.currentChannel?.id)
  const broadcasterId = useChannelStore((s) => s.currentChannel?.broadcasterId)

  const [editTitle, setEditTitle] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [editGame, setEditGame] = useState(false)
  const [newGame, setNewGame] = useState('')

  const { data, isLoading, isRefetching, refetch } = useQuery<StreamInfo>({
    queryKey: ['stream', channelId],
    queryFn: async () => {
      const res = await apiClient.get<{ data: StreamInfo }>(`/v1/channels/${channelId}/stream`)
      return res.data.data
    },
    enabled: !!channelId,
    refetchInterval: 15_000,
  })

  const updateTitleMutation = useApiMutation<StreamInfo, { title: string }>(
    '/stream/title',
    'patch',
    {
      invalidateKeys: ['stream'],
      successMessage: 'Stream title updated',
      onSuccess: () => setEditTitle(false),
    },
  )

  const updateGameMutation = useApiMutation<StreamInfo, { gameName: string }>(
    '/stream/game',
    'patch',
    {
      invalidateKeys: ['stream'],
      successMessage: 'Stream category updated',
      onSuccess: () => setEditGame(false),
    },
  )

  function handleEditTitle() {
    setNewTitle(data?.title ?? '')
    setEditTitle(true)
  }

  function handleSaveTitle() {
    if (!newTitle.trim()) return
    updateTitleMutation.mutate({ title: newTitle.trim() })
  }

  function handleEditGame() {
    setNewGame(data?.gameName ?? '')
    setEditGame(true)
  }

  function handleSaveGame() {
    if (!newGame.trim()) return
    updateGameMutation.mutate({ gameName: newGame.trim() })
  }

  return (
    <ErrorBoundary>
    <ScrollView
      className="flex-1 bg-gray-950"
      contentContainerClassName="pb-8"
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
    >
      <PageHeader
        title="Stream Info"
        subtitle={data?.isLive ? 'Live now' : 'Not streaming'}
        rightContent={
          <Button size="sm" variant="ghost" onPress={() => refetch()} label="Refresh" />
        }
      />

      <View className="px-4 pt-4 gap-4">
        {isLoading ? (
          <Skeleton className="h-28 w-full" count={3} />
        ) : (
          <>
            {/* Status Card */}
            <Card>
              <CardHeader
                title="Stream Status"
                action={
                  <Badge
                    variant={data?.isLive ? 'danger' : 'muted'}
                    label={data?.isLive ? '● LIVE' : 'Offline'}
                  />
                }
              />
              <View className="px-4 py-3 gap-1">
                <View className="flex-row items-start justify-between gap-2">
                  <View className="flex-1">
                    <Text className="text-xs text-gray-500 mb-1">Title</Text>
                    {editTitle ? (
                      <View className="gap-2">
                        <Input
                          value={newTitle}
                          onChangeText={setNewTitle}
                          placeholder="Stream title"
                          autoFocus
                        />
                        <View className="flex-row gap-2">
                          <Button
                            size="sm"
                            label="Save"
                            loading={updateTitleMutation.isPending}
                            onPress={handleSaveTitle}
                            className="flex-1"
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            label="Cancel"
                            onPress={() => setEditTitle(false)}
                            className="flex-1"
                          />
                        </View>
                      </View>
                    ) : (
                      <View className="flex-row items-center justify-between">
                        <Text className="text-sm text-gray-100 flex-1 mr-2">
                          {data?.title || 'No title set'}
                        </Text>
                        <Button
                          size="sm"
                          variant="ghost"
                          onPress={handleEditTitle}
                          leftIcon={<Edit2 size={12} color="rgb(156,163,175)" />}
                          label="Edit"
                        />
                      </View>
                    )}
                  </View>
                </View>

                <View className="mt-2">
                  <Text className="text-xs text-gray-500 mb-1">Category</Text>
                  {editGame ? (
                    <View className="gap-2">
                      <Input
                        value={newGame}
                        onChangeText={setNewGame}
                        placeholder="Game or category name"
                        autoFocus
                      />
                      <View className="flex-row gap-2">
                        <Button
                          size="sm"
                          label="Save"
                          loading={updateGameMutation.isPending}
                          onPress={handleSaveGame}
                          className="flex-1"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          label="Cancel"
                          onPress={() => setEditGame(false)}
                          className="flex-1"
                        />
                      </View>
                    </View>
                  ) : (
                    <View className="flex-row items-center justify-between">
                      <Text className="text-sm text-gray-100 flex-1 mr-2">
                        {data?.gameName || 'No category set'}
                      </Text>
                      <Button
                        size="sm"
                        variant="ghost"
                        onPress={handleEditGame}
                        leftIcon={<Edit2 size={12} color="rgb(156,163,175)" />}
                        label="Edit"
                      />
                    </View>
                  )}
                </View>
              </View>
            </Card>

            {/* Statistics Card */}
            <Card>
              <CardHeader title="Statistics" />
              <View className="px-4 py-2">
                <StatRow
                  label="Viewers"
                  value={(data?.viewerCount ?? 0).toLocaleString()}
                  icon={<Eye size={14} color="rgb(156,163,175)" />}
                />
                <StatRow
                  label="Followers"
                  value={(data?.followerCount ?? 0).toLocaleString()}
                  icon={<Radio size={14} color="rgb(156,163,175)" />}
                />
                {data?.isLive && data.uptime != null && (
                  <StatRow
                    label="Uptime"
                    value={formatUptime(data.uptime)}
                    icon={<Clock size={14} color="rgb(156,163,175)" />}
                  />
                )}
              </View>
            </Card>

            {/* Stream Health */}
            {data?.isLive && (data.bitrate != null || data.fps != null) && (
              <Card>
                <CardHeader title="Stream Health" />
                <View className="px-4 py-2">
                  {data.bitrate != null && (
                    <StatRow
                      label="Bitrate"
                      value={`${data.bitrate.toLocaleString()} kbps`}
                      icon={<Activity size={14} color="rgb(156,163,175)" />}
                    />
                  )}
                  {data.fps != null && (
                    <StatRow
                      label="FPS"
                      value={`${data.fps} fps`}
                      icon={<Film size={14} color="rgb(156,163,175)" />}
                    />
                  )}
                </View>
              </Card>
            )}

            {!data?.isLive && (
              <Card className="px-4 py-6 items-center gap-2">
                <Zap size={32} color="rgb(107,114,128)" />
                <Text className="text-gray-400 font-medium text-center">Stream is offline</Text>
                <Text className="text-gray-600 text-sm text-center">
                  Stats will appear once you go live.
                </Text>
              </Card>
            )}
          </>
        )}
      </View>
    </ScrollView>
    </ErrorBoundary>
  )
}
