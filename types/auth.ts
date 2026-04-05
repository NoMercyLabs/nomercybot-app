export interface User {
  id: string
  twitchId: string
  login: string
  displayName: string
  profileImageUrl: string
  chatColor: string
  email: string
  isAdmin: boolean
  permissions: string[]
  createdAt: string
}

export interface Session {
  user: User
  accessToken: string
  refreshToken: string
  expiresAt: number
}

export interface TokenResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
  user: User
}

export type Permission =
  | 'commands.view'
  | 'commands.edit'
  | 'commands.delete'
  | 'rewards.edit'
  | 'chat.send'
  | 'moderation.ban'
  | 'moderation.timeout'
  | 'settings.manage'
  | 'pipelines.edit'
  | 'widgets.edit'
  | 'music.control'
  | 'stream.update'
  | 'admin'
