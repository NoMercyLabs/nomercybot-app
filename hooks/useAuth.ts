import { createContext, useContext, useEffect, type ReactNode } from 'react'
import { useSegments, useRouter } from 'expo-router'
import { useAuthStore } from '@/stores/useAuthStore'
import { TOKEN_REFRESH_INTERVAL } from '@/lib/utils/constants'
import type { User } from '@/types/auth'

interface AuthContextValue {
  isAuthenticated: boolean
  isLoading: boolean
  user: User | null
  login: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const segments = useSegments()
  const router = useRouter()
  const { user, accessToken, isLoading, refreshToken, logout: storeLogout } = useAuthStore()
  const isAuthenticated = !!accessToken && !!user

  useEffect(() => {
    if (isLoading) return
    const inAuthGroup = segments[0] === '(auth)'
    const inPublicGroup = segments[0] === '(public)'
    if (inPublicGroup) return
    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login')
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(dashboard)')
    }
  }, [isAuthenticated, segments, isLoading])

  useEffect(() => {
    if (!isAuthenticated) return
    const interval = setInterval(() => { refreshToken() }, TOKEN_REFRESH_INTERVAL)
    return () => clearInterval(interval)
  }, [isAuthenticated, refreshToken])

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      isLoading,
      user,
      login: async () => {},
      logout: async () => { storeLogout() },
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
