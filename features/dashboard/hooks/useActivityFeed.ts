import { useState, useEffect } from 'react'
import { useSignalR } from '@/hooks/useSignalR'
import { useChannelStore } from '@/stores/useChannelStore'
import type { ActivityEvent } from '../types'

export function useActivityFeed() {
  const [events, setEvents] = useState<ActivityEvent[]>([])
  const { on, off, status } = useSignalR()
  const channelId = useChannelStore((s) => s.currentChannel?.id)

  useEffect(() => {
    if (status !== 'connected') return

    on('NewEvent', (data) => {
      if (data.channelId !== channelId) return
      const event: ActivityEvent = {
        id: data.id,
        type: data.type as ActivityEvent['type'],
        userId: (data.data as any).userId ?? '',
        displayName: (data.data as any).displayName ?? 'Unknown',
        data: data.data,
        timestamp: data.timestamp,
      }
      setEvents((prev) => [event, ...prev].slice(0, 50))
    })

    return () => { off('NewEvent') }
  }, [status, channelId, on, off])

  return { events }
}
