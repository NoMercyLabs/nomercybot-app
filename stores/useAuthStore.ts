import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { appStorage } from '@/lib/storage'
import { apiClient, setAuthToken } from '@/lib/api/client'
import { setSignalRTokenGetter, destroyAllConnections } from '@/lib/signalr/connection'
import * as WebBrowser from 'expo-web-browser'
import { makeRedirectUri } from 'expo-auth-session'
import { Platform } from 'react-native'
import type { User } from '@/types/auth'

WebBrowser.maybeCompleteAuthSession()

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshTokenValue: string | null
  expiresAt: number | null
  isLoading: boolean
  isRefreshing: boolean
  isAuthenticated: boolean
  onboardingComplete: boolean
  grantedScopes: string[]
  pendingScopeUpgrade: string[] | null

  init: () => Promise<void>
  login: () => Promise<void>
  logout: () => Promise<void>
  handleCallback: (params: { code?: string; state?: string; token?: string; scopes?: string }) => Promise<boolean>
  completeOnboarding: () => void
  setAuth: (data: { user: User; accessToken: string; refreshToken: string; expiresIn: number; scopes?: string[] }) => void
  refreshToken: () => Promise<void>
  setLoading: (loading: boolean) => void
  requestScopeUpgrade: (scopes: string[]) => Promise<void>
  dismissScopeUpgrade: () => void
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
      isRefreshing: false,
      isAuthenticated: false,
      onboardingComplete: false,
      grantedScopes: [],
      pendingScopeUpgrade: null,

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
        if (Platform.OS === 'web') {
          const base = typeof window !== 'undefined' ? window.location.origin : API_URL
          window.location.href = `${base}/auth/twitch`
          return
        }
        const authUrl = `${API_URL}/api/auth/twitch?redirect_uri=${encodeURIComponent(redirectUri)}`
        await WebBrowser.openAuthSessionAsync(authUrl, redirectUri)
        // Result handled by deep-link → app/(auth)/callback.tsx
      },

      handleCallback: async ({ code, state: oauthState, token, scopes }) => {
        set({ isLoading: true })
        try {
          const redirectUri = makeRedirectUri({ scheme: 'nomercybot', path: 'callback' })
          let res: { data: { user: User; accessToken: string; refreshToken: string; expiresIn: number; scopes?: string[] } }

          if (token) {
            res = await apiClient.post('/auth/exchange', { token })
          } else if (code) {
            res = await apiClient.post('/auth/twitch/callback', { code, state: oauthState, redirectUri })
          } else {
            return false
          }

          const grantedScopes = res.data.scopes ?? (scopes ? scopes.split(' ') : [])
          get().setAuth({ ...res.data, scopes: grantedScopes })
          return true
        } catch {
          return false
        } finally {
          set({ isLoading: false })
        }
      },

      completeOnboarding: () => set({ onboardingComplete: true }),

      setAuth: ({ user, accessToken, refreshToken, expiresIn, scopes }) => {
        set({
          user,
          accessToken,
          refreshTokenValue: refreshToken,
          expiresAt: Date.now() + expiresIn * 1000,
          isAuthenticated: true,
          grantedScopes: scopes ?? get().grantedScopes,
          pendingScopeUpgrade: null,
        })
        setAuthToken(accessToken)
        setSignalRTokenGetter(() => useAuthStore.getState().accessToken ?? '')
      },

      refreshToken: async () => {
        const { refreshTokenValue } = get()
        if (!refreshTokenValue) return

        set({ isRefreshing: true })
        try {
          const res = await apiClient.post<{
            accessToken: string
            refreshToken: string
            expiresIn: number
          }>('/auth/refresh', { refreshToken: refreshTokenValue })

          set({
            accessToken: res.data.accessToken,
            refreshTokenValue: res.data.refreshToken,
            expiresAt: Date.now() + res.data.expiresIn * 1000,
          })
          setAuthToken(res.data.accessToken)
        } catch {
          await get().logout()
        } finally {
          set({ isRefreshing: false })
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
          grantedScopes: [],
          pendingScopeUpgrade: null,
        })
      },

      setLoading: (loading) => set({ isLoading: loading }),

      requestScopeUpgrade: async (scopes: string[]) => {
        const { grantedScopes } = get()
        const missing = scopes.filter((s) => !grantedScopes.includes(s))
        if (missing.length === 0) return
        set({ pendingScopeUpgrade: missing })
      },

      dismissScopeUpgrade: () => set({ pendingScopeUpgrade: null }),
    }),
    {
      name: 'nomercybot-auth',
      storage: createJSONStorage(() => appStorage),
      partialize: (state) => {
        const base = {
          user: state.user,
          expiresAt: state.expiresAt,
          isAuthenticated: state.isAuthenticated,
          onboardingComplete: state.onboardingComplete,
          grantedScopes: state.grantedScopes,
        }
        if (Platform.OS === 'web') {
          // On web, localStorage is plaintext — keep tokens in-memory only
          return base
        }
        // On native, SecureStore encrypts — safe to persist tokens
        return { ...base, accessToken: state.accessToken, refreshTokenValue: state.refreshTokenValue }
      },
    },
  ),
)
