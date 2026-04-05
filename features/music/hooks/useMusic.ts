import { useApiQuery, useApiMutation } from '@/hooks/useApi'
import { useSignalR } from '@/hooks/useSignalR'
import { useChannelStore } from '@/stores/useChannelStore'
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { MusicQueue } from '../types'

export function useMusic() {
  const { on, off, status } = useSignalR()
  const channelId = useChannelStore((s) => s.currentChannel?.id)
  const queryClient = useQueryClient()

  const query = useApiQuery<MusicQueue>('music-queue', '/music/queue')

  useEffect(() => {
    if (status !== 'connected') return
    on('NowPlayingChanged', (data) => {
      queryClient.setQueryData(['channel', channelId, 'music-queue'], (old: MusicQueue | undefined) =>
        old ? { ...old, nowPlaying: data.track } : old,
      )
    })
    on('QueueUpdated', () => {
      queryClient.invalidateQueries({ queryKey: ['channel', channelId, 'music-queue'] })
    })
    return () => { off('NowPlayingChanged'); off('QueueUpdated') }
  }, [status, channelId, on, off, queryClient])

  const skipMutation = useApiMutation<void, void>('/music/skip', 'post', {
    invalidateKeys: ['music-queue'],
  })

  return {
    nowPlaying: query.data?.nowPlaying ?? null,
    queue: query.data?.queue ?? [],
    isLoading: query.isLoading,
    skip: () => skipMutation.mutateAsync(undefined as any),
  }
}
