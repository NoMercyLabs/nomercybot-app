import { useEffect, useState, useCallback } from 'react'
import { HubConnectionState } from '@microsoft/signalr'
import { AppState, Platform } from 'react-native'
import { useAuthStore } from '@/stores/useAuthStore'
import {
  getDashboardConnection,
  incrementDashboardRefCount,
  decrementDashboardRefCount,
  getDashboardRefCount,
  destroyDashboardConnection,
  setSignalRTokenGetter,
} from '@/lib/signalr/connection'
import type { SignalREventMap } from '@/types/signalr'
import type { ConnectionStatus } from '@/lib/signalr/types'

let statusListeners = new Set<(status: ConnectionStatus) => void>()

function broadcastStatus(status: ConnectionStatus) {
  statusListeners.forEach((fn) => fn(status))
}

export function useSignalR() {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected')
  const [error, setError] = useState<string | null>(null)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  // Register the dynamic token getter once (and whenever auth changes)
  useEffect(() => {
    setSignalRTokenGetter(() => useAuthStore.getState().accessToken ?? '')
  }, [isAuthenticated])

  useEffect(() => {
    statusListeners.add(setStatus)
    return () => { statusListeners.delete(setStatus) }
  }, [])

  const connect = useCallback(async () => {
    if (!useAuthStore.getState().isAuthenticated) return

    const conn = getDashboardConnection()
    incrementDashboardRefCount()

    conn.onreconnecting(() => broadcastStatus('reconnecting'))
    conn.onreconnected(() => broadcastStatus('connected'))
    conn.onclose(() => broadcastStatus('disconnected'))

    if (conn.state === HubConnectionState.Disconnected) {
      broadcastStatus('connecting')
      try {
        await conn.start()
        broadcastStatus('connected')
      } catch (e) {
        broadcastStatus('disconnected')
        setError((e as Error).message)
      }
    } else if (conn.state === HubConnectionState.Connected) {
      broadcastStatus('connected')
    }
  }, [])

  const disconnect = useCallback(async () => {
    decrementDashboardRefCount()
    if (getDashboardRefCount() <= 0) {
      await destroyDashboardConnection()
      broadcastStatus('disconnected')
    }
  }, [])

  const on = useCallback(<K extends keyof SignalREventMap>(
    event: K,
    handler: (data: SignalREventMap[K]) => void,
  ) => {
    const conn = getDashboardConnection()
    conn.on(event as string, handler)
  }, [])

  const off = useCallback(<K extends keyof SignalREventMap>(event: K) => {
    const conn = getDashboardConnection()
    conn.off(event as string)
  }, [])

  const invoke = useCallback(async <T>(method: string, ...args: unknown[]): Promise<T> => {
    if (!useAuthStore.getState().isAuthenticated) throw new Error('Not authenticated')
    const conn = getDashboardConnection()
    if (conn.state !== HubConnectionState.Connected) {
      throw new Error('SignalR not connected')
    }
    return conn.invoke<T>(method, ...args)
  }, [])

  // Re-connect when app comes back to foreground on mobile
  useEffect(() => {
    if (Platform.OS === 'web') return

    const subscription = AppState.addEventListener('change', async (nextState) => {
      if (!useAuthStore.getState().isAuthenticated) return
      const conn = getDashboardConnection()

      if (nextState === 'active' && conn.state === HubConnectionState.Disconnected) {
        broadcastStatus('connecting')
        try {
          await conn.start()
          broadcastStatus('connected')
        } catch (e) {
          setError((e as Error).message)
        }
      }
    })

    return () => subscription.remove()
  }, [])

  useEffect(() => {
    return () => { disconnect() }
  }, [disconnect])

  return { status, error, connect, disconnect, on, off, invoke }
}
