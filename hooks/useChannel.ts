import { useChannelStore } from '@/stores/useChannelStore'

export function useChannel() {
  const store = useChannelStore()
  return {
    currentChannel: store.currentChannel,
    channelId: store.currentChannel?.id ?? null,
    channels: store.channels,
    isLive: store.currentChannel?.isLive ?? false,
    selectChannel: store.selectChannel,
    fetchChannels: store.fetchChannels,
  }
}
