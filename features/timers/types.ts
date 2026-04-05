export interface Timer {
  id: string
  name: string
  messages: string[]
  intervalMinutes: number
  minChatLines: number
  isEnabled: boolean
  lastTriggeredAt?: string
  createdAt: string
  updatedAt: string
}

export interface TimerCreate {
  name: string
  messages: string[]
  intervalMinutes: number
  minChatLines?: number
}

export interface TimerUpdate extends Partial<TimerCreate> {
  isEnabled?: boolean
}
