export interface Channel {
  id: string
  twitchId: string
  login: string
  displayName: string
  profileImageUrl: string
  isLive: boolean
  viewerCount: number
  title?: string
  gameName?: string
  startedAt?: string
  overlayToken: string
  botEnabled: boolean
  createdAt: string
}

export interface ChannelConfig {
  prefix: string
  locale: string
  ttsEnabled: boolean
  moderationEnabled: boolean
  loyaltyEnabled: boolean
}
