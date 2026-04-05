import { apiClient } from '@/lib/api/client'
import type { Timer, TimerCreate, TimerUpdate } from './types'

export const timersApi = {
  list: (broadcasterId: string) =>
    apiClient.get<Timer[]>(`/api/${broadcasterId}/timers`).then((r) => r.data),

  get: (broadcasterId: string, id: string) =>
    apiClient.get<Timer>(`/api/${broadcasterId}/timers/${id}`).then((r) => r.data),

  create: (broadcasterId: string, data: TimerCreate) =>
    apiClient.post<Timer>(`/api/${broadcasterId}/timers`, data).then((r) => r.data),

  update: (broadcasterId: string, id: string, data: TimerUpdate) =>
    apiClient.patch<Timer>(`/api/${broadcasterId}/timers/${id}`, data).then((r) => r.data),

  delete: (broadcasterId: string, id: string) =>
    apiClient.delete(`/api/${broadcasterId}/timers/${id}`),
}
