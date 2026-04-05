import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { appStorage } from '@/lib/storage'
import { apiClient } from '@/lib/api/client'
import type { Channel } from '@/types/channel'

interface ChannelState {
  currentChannel: Channel | null
  channels: Channel[]
  loading: boolean
  error: string | null

  channelId: () => string | null
  channelName: () => string
  isLive: () => boolean

  fetchChannels: () => Promise<void>
  selectChannel: (idOrLogin: string) => Promise<void>
  updateFromRealtime: (patch: Partial<Channel>) => void
  reset: () => void
}

export const useChannelStore = create<ChannelState>()(
  persist(
    (set, get) => ({
      currentChannel: null,
      channels: [],
      loading: false,
      error: null,

      channelId: () => get().currentChannel?.id ?? null,
      channelName: () => get().currentChannel?.displayName ?? '',
      isLive: () => get().currentChannel?.isLive ?? false,

      fetchChannels: async () => {
        set({ loading: true, error: null })
        try {
          const res = await apiClient.get<{ data: Channel[] }>('/api/v1/channels')
          const channels = res.data.data
          set({ channels })
          const { currentChannel } = get()
          if (!currentChannel && channels.length > 0) {
            set({ currentChannel: channels[0] })
          }
        } catch (e) {
          set({ error: (e as Error).message })
        } finally {
          set({ loading: false })
        }
      },

      selectChannel: async (idOrLogin: string) => {
        set({ loading: true })
        try {
          const res = await apiClient.get<{ data: Channel }>(`/api/v1/channels/${idOrLogin}`)
          set({ currentChannel: res.data.data })
        } finally {
          set({ loading: false })
        }
      },

      updateFromRealtime: (patch) => {
        const { currentChannel } = get()
        if (currentChannel) {
          set({ currentChannel: { ...currentChannel, ...patch } })
        }
      },

      reset: () => set({ currentChannel: null, channels: [], loading: false, error: null }),
    }),
    {
      name: 'nomercybot-channel',
      storage: createJSONStorage(() => appStorage),
      partialize: (state: ChannelState) => ({
        currentChannel: state.currentChannel,
      }),
    },
  ),
)
