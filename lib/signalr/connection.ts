import {
  HubConnectionBuilder,
  HubConnection,
  HubConnectionState,
  LogLevel,
} from '@microsoft/signalr'
import { Platform } from 'react-native'
import { SIGNALR_HUB_URL } from '@/lib/utils/constants'

let connection: HubConnection | null = null
let refCount = 0

export function getSignalRConnection(accessToken: string): HubConnection {
  if (!connection) {
    const baseUrl = Platform.OS === 'web'
      ? '/hubs/dashboard'
      : SIGNALR_HUB_URL

    connection = new HubConnectionBuilder()
      .withUrl(baseUrl, {
        accessTokenFactory: () => accessToken,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          if (retryContext.elapsedMilliseconds > 120000) return null
          return Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 30000)
        },
      })
      .configureLogging(__DEV__ ? LogLevel.Information : LogLevel.Warning)
      .build()
  }
  return connection
}

export function incrementRefCount() { refCount++ }
export function decrementRefCount() { refCount-- }
export function getRefCount() { return refCount }

export async function destroyConnection() {
  if (connection) {
    await connection.stop()
    connection = null
    refCount = 0
  }
}

export function getConnectionState(): HubConnectionState {
  return connection?.state ?? HubConnectionState.Disconnected
}
