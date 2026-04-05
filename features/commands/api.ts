import { apiClient } from '@/lib/api/client'
import type { Command, CommandCreate, CommandUpdate } from './types'

export async function fetchCommands(channelId: string) {
  const res = await apiClient.get<Command[]>(`/channels/${channelId}/commands`)
  return res.data
}

export async function fetchCommand(channelId: string, name: string) {
  const res = await apiClient.get<Command>(`/channels/${channelId}/commands/${name}`)
  return res.data
}

/** Alias for fetchCommand — matches the task spec naming */
export const getCommand = fetchCommand

export async function createCommand(channelId: string, data: CommandCreate) {
  const res = await apiClient.post<Command>(`/channels/${channelId}/commands`, data)
  return res.data
}

export async function updateCommand(channelId: string, name: string, data: CommandUpdate) {
  const res = await apiClient.put<Command>(`/channels/${channelId}/commands/${name}`, data)
  return res.data
}

export async function deleteCommand(channelId: string, name: string) {
  await apiClient.delete(`/channels/${channelId}/commands/${name}`)
}
