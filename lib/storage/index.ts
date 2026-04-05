import { Platform } from 'react-native'
import type { StateStorage } from 'zustand/middleware'

export const appStorage: StateStorage = Platform.select({
  web: {
    getItem: (name: string) => localStorage.getItem(name),
    setItem: (name: string, value: string) => localStorage.setItem(name, value),
    removeItem: (name: string) => localStorage.removeItem(name),
  },
  default: (() => {
    let SecureStore: typeof import('expo-secure-store') | null = null

    const getStore = async () => {
      if (!SecureStore) {
        SecureStore = await import('expo-secure-store')
      }
      return SecureStore
    }

    return {
      getItem: async (name: string) => {
        const store = await getStore()
        return store.getItemAsync(name)
      },
      setItem: async (name: string, value: string) => {
        const store = await getStore()
        await store.setItemAsync(name, value)
      },
      removeItem: async (name: string) => {
        const store = await getStore()
        await store.deleteItemAsync(name)
      },
    }
  })(),
})!
