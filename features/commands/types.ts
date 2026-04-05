export type PermissionLevel = 'everyone' | 'subscriber' | 'vip' | 'moderator' | 'broadcaster'

export type CommandType = 'text' | 'pipeline'

export interface Command {
  id: string
  name: string
  type?: CommandType
  permission: PermissionLevel
  isEnabled?: boolean
  enabled?: boolean
  response?: string
  responses?: string[]
  pipeline?: string
  cooldown: number
  cooldownSeconds?: number
  cooldownPerUser?: boolean
  description?: string
  aliases: string[]
  usageCount?: number
  createdAt: string
  updatedAt: string
}

export interface CommandCreate {
  name: string
  type?: CommandType
  response?: string
  responses?: string[]
  pipeline?: string
  cooldown?: number
  cooldownPerUser?: boolean
  permission?: PermissionLevel
  aliases?: string[]
  description?: string
  enabled?: boolean
}

export interface CommandUpdate extends Partial<CommandCreate> {
  enabled?: boolean
  isEnabled?: boolean
}
