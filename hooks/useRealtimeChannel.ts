import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useSignalR } from './useSignalR'
import { useChannelStore } from '@/stores/useChannelStore'

export function useRealtimeChannel() {
  const { connect, invoke, on, off, status } = useSignalR()
  const channelId = useChannelStore((s) => s.currentChannel?.id)
  const updateFromRealtime = useChannelStore((s) => s.updateFromRealtime)
  const queryClient = useQueryClient()
  const currentGroupRef = useRef<string | null>(null)

  useEffect(() => { connect() }, [connect])

  useEffect(() => {
    if (status !== 'connected' || !channelId) return

    const join = async () => {
      if (currentGroupRef.current) {
        await invoke('LeaveChannel', currentGroupRef.current)
      }
      await invoke('JoinChannel', channelId)
      currentGroupRef.current = channelId
    }

    join()

    return () => {
      if (currentGroupRef.current) {
        invoke('LeaveChannel', currentGroupRef.current).catch(() => {})
        currentGroupRef.current = null
      }
    }
  }, [status, channelId, invoke])

  useEffect(() => {
    if (status !== 'connected') return

    on('ChannelUpdated', (data) => updateFromRealtime(data))
    on('ChannelWentLive', () => updateFromRealtime({ isLive: true }))
    on('ChannelWentOffline', () => updateFromRealtime({ isLive: false, viewerCount: 0 }))

    on('CommandUpdated', () => {
      queryClient.invalidateQueries({ queryKey: ['channel', channelId, 'commands'] })
    })
    on('CommandDeleted', () => {
      queryClient.invalidateQueries({ queryKey: ['channel', channelId, 'commands'] })
    })
    on('NewEvent', () => {
      queryClient.invalidateQueries({ queryKey: ['channel', channelId, 'events'] })
    })
    on('NowPlayingChanged', (data) => {
      queryClient.setQueryData(['channel', channelId, 'now-playing'], data.track)
    })
    on('QueueUpdated', () => {
      queryClient.invalidateQueries({ queryKey: ['channel', channelId, 'queue'] })
    })
    on('BotStatus', (data) => {
      queryClient.setQueryData(['channel', channelId, 'bot-status'], data)
    })

    return () => {
      off('ChannelUpdated')
      off('ChannelWentLive')
      off('ChannelWentOffline')
      off('CommandUpdated')
      off('CommandDeleted')
      off('NewEvent')
      off('NowPlayingChanged')
      off('QueueUpdated')
      off('BotStatus')
    }
  }, [status, channelId, on, off, queryClient, updateFromRealtime])

  return { status }
}
