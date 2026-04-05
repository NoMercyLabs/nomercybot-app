import type { StateStorage } from 'zustand/middleware'
import * as SecureStore from 'expo-secure-store'

export const nativeStorage: StateStorage = {
  getItem: (name: string) => SecureStore.getItemAsync(name),
  setItem: (name: string, value: string) => SecureStore.setItemAsync(name, value),
  removeItem: (name: string) => SecureStore.deleteItemAsync(name),
}
