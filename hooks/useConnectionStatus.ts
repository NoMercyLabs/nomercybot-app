import { useSignalR } from './useSignalR'

export function useConnectionStatus() {
  const { status, error } = useSignalR()
  return {
    status,
    error,
    isConnected: status === 'connected',
    isConnecting: status === 'connecting' || status === 'reconnecting',
  }
}
