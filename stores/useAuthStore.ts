import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { appStorage } from '@/lib/storage'
import { apiClient, setAuthToken } from '@/lib/api/client'
import { setSignalRTokenGetter, destroyAllConnections } from '@/lib/signalr/connection'
import * as WebBrowser from 'expo-web-browser'
import { makeRedirectUri } from 'expo-auth-session'
import type { User } from '@/types/auth'

WebBrowser.maybeCompleteAuthSession()

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshTokenValue: string | null
  expiresAt: number | null
  isLoading: boolean
  isAuthenticated: boolean
  onboardingComplete: boolean

  init: () => Promise<void>
  login: () => Promise<void>
  logout: () => Promise<void>
  handleCallback: (code: string, state?: string) => Promise<boolean>
  completeOnboarding: () => void
  setAuth: (data: { user: User; accessToken: string; refreshToken: string; expiresIn: number }) => void
  refreshToken: () => Promise<void>
  setLoading: (loading: boolean) => void
}

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:7000'

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshTokenValue: null,
      expiresAt: null,
      isLoading: false,
      isAuthenticated: false,
      onboardingComplete: false,

      init: async () => {
        const { accessToken, expiresAt } = get()
        if (!accessToken) return

        // Register token for API calls and SignalR
        setAuthToken(accessToken)
        setSignalRTokenGetter(() => useAuthStore.getState().accessToken ?? '')

        // Proactively refresh if expiring within 5 minutes
        if (expiresAt && Date.now() > expiresAt - 5 * 60 * 1000) {
          await get().refreshToken()
        }
      },

      login: async () => {
        const redirectUri = makeRedirectUri({ scheme: 'nomercybot', path: 'callback' })
        const authUrl = `${API_URL}/api/auth/twitch?redirect_uri=${encodeURIComponent(redirectUri)}`
        await WebBrowser.openAuthSessionAsync(authUrl, redirectUri)
        // Callback handled by deep link → app/(auth)/callback.tsx
      },

      handleCallback: async (code: string, state?: string) => {
        set({ isLoading: true })
        try {
          const redirectUri = makeRedirectUri({ scheme: 'nomercybot', path: 'callback' })
          const res = await apiClient.post<{
            user: User
            accessToken: string
            refreshToken: string
            expiresIn: number
          }>('/api/auth/twitch/callback', { code, state, redirectUri })

          get().setAuth(res.data)
          return true
        } catch {
          return false
        } finally {
          set({ isLoading: false })
        }
      },

      completeOnboarding: () => set({ onboardingComplete: true }),

      setAuth: ({ user, accessToken, refreshToken, expiresIn }) => {
        set({
          user,
          accessToken,
          refreshTokenValue: refreshToken,
          expiresAt: Date.now() + expiresIn * 1000,
          isAuthenticated: true,
        })
        setAuthToken(accessToken)
        setSignalRTokenGetter(() => useAuthStore.getState().accessToken ?? '')
      },

      refreshToken: async () => {
        const { refreshTokenValue } = get()
        if (!refreshTokenValue) return

        set({ isLoading: true })
        try {
          const res = await apiClient.post<{
            accessToken: string
            refreshToken: string
            expiresIn: number
          }>('/api/auth/refresh', { refreshToken: refreshTokenValue })

          set({
            accessToken: res.data.accessToken,
            refreshTokenValue: res.data.refreshToken,
            expiresAt: Date.now() + res.data.expiresIn * 1000,
          })
          setAuthToken(res.data.accessToken)
        } catch {
          await get().logout()
        } finally {
          set({ isLoading: false })
        }
      },

      logout: async () => {
        setAuthToken(null)
        await destroyAllConnections()
        set({
          user: null,
          accessToken: null,
          refreshTokenValue: null,
          expiresAt: null,
          isAuthenticated: false,
        })
      },

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'nomercybot-auth',
      storage: createJSONStorage(() => appStorage),
      // partialize selects which fields to persist (only data, not actions)
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshTokenValue: state.refreshTokenValue,
        expiresAt: state.expiresAt,
        isAuthenticated: state.isAuthenticated,
        onboardingComplete: state.onboardingComplete,
      }),
    },
  ),
)
