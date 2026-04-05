import { useEffect, useRef, useState, useCallback } from 'react'
import { HubConnectionState, AppState as AppStateRN, Platform } from 'react-native'
import { AppState } from 'react-native'
import { useAuthStore } from '@/stores/useAuthStore'
import {
  getSignalRConnection,
  destroyConnection,
  incrementRefCount,
  decrementRefCount,
  getRefCount,
} from '@/lib/signalr/connection'
import type { SignalREventMap } from '@/types/signalr'
import type { ConnectionStatus } from '@/lib/signalr/types'

let statusListeners = new Set<(status: ConnectionStatus) => void>()

export function useSignalR() {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected')
  const [error, setError] = useState<string | null>(null)
  const accessToken = useAuthStore((s) => s.accessToken)
  const currentChannelRef = useRef<string | null>(null)

  useEffect(() => {
    statusListeners.add(setStatus)
    return () => { statusListeners.delete(setStatus) }
  }, [])

  const connect = useCallback(async () => {
    if (!accessToken) return
    const conn = getSignalRConnection(accessToken)
    incrementRefCount()

    if (conn.state === HubConnectionState.Disconnected) {
      statusListeners.forEach((fn) => fn('connecting'))
      try {
        conn.onreconnecting(() => statusListeners.forEach((fn) => fn('reconnecting')))
        conn.onreconnected(() => statusListeners.forEach((fn) => fn('connected')))
        conn.onclose(() => statusListeners.forEach((fn) => fn('disconnected')))
        await conn.start()
        statusListeners.forEach((fn) => fn('connected'))
      } catch (e) {
        statusListeners.forEach((fn) => fn('disconnected'))
        setError((e as Error).message)
      }
    } else {
      statusListeners.forEach((fn) => fn('connected'))
    }
  }, [accessToken])

  const disconnect = useCallback(async () => {
    decrementRefCount()
    if (getRefCount() <= 0) {
      await destroyConnection()
      statusListeners.forEach((fn) => fn('disconnected'))
    }
  }, [])

  const on = useCallback(<K extends keyof SignalREventMap>(
    event: K,
    handler: (data: SignalREventMap[K]) => void,
  ) => {
    if (!accessToken) return
    const conn = getSignalRConnection(accessToken)
    conn.on(event as string, handler)
  }, [accessToken])

  const off = useCallback((event: keyof SignalREventMap) => {
    if (!accessToken) return
    const conn = getSignalRConnection(accessToken)
    conn.off(event as string)
  }, [accessToken])

  const invoke = useCallback(async <T>(method: string, ...args: unknown[]): Promise<T> => {
    if (!accessToken) throw new Error('Not authenticated')
    const conn = getSignalRConnection(accessToken)
    if (conn.state !== HubConnectionState.Connected) throw new Error('SignalR not connected')
    return conn.invoke<T>(method, ...args)
  }, [accessToken])

  useEffect(() => {
    if (Platform.OS === 'web') return
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active' && accessToken) {
        connect()
      }
    })
    return () => subscription.remove()
  }, [connect, accessToken])

  useEffect(() => {
    return () => { disconnect() }
  }, [disconnect])

  return { status, error, connect, disconnect, on, off, invoke }
}
