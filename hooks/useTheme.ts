import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react'
import { Platform, View } from 'react-native'
import { useThemeStore } from '@/stores/useThemeStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { hexToRgbPalette } from '@/lib/theme/colors'
import { vars, useColorScheme as useNWColorScheme } from 'nativewind'

interface ThemeContextValue {
  isDark: boolean
  toggleDark: () => void
  accentHex: string
  setAccent: (hex: string | null) => void
  resetAccent: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { isDark, toggleDark, accentOverride, setAccent, resetAccent } = useThemeStore()
  const chatColor = useAuthStore((s) => s.user?.chatColor)
  const { setColorScheme } = useNWColorScheme()

  const accentHex = accentOverride ?? chatColor ?? '#9147ff'

  const accentVars = useMemo(() => {
    const palette = hexToRgbPalette(accentHex)
    const cssVars: Record<string, string> = {}
    for (const [shade, rgb] of Object.entries(palette)) {
      cssVars[`--color-accent-${shade}`] = rgb
    }
    return cssVars
  }, [accentHex])

  useEffect(() => {
    if (Platform.OS !== 'web') return
    const root = document.documentElement
    for (const [key, value] of Object.entries(accentVars)) {
      root.style.setProperty(key, value)
    }
  }, [accentVars])

  useEffect(() => {
    setColorScheme(isDark ? 'dark' : 'light')
  }, [isDark, setColorScheme])

  const nativeVars = useMemo(() => {
    if (Platform.OS === 'web') return {}
    return vars(accentVars)
  }, [accentVars])

  return (
    <ThemeContext.Provider value={{ isDark, toggleDark, accentHex, setAccent, resetAccent }}>
      {Platform.OS === 'web' ? children : (
        <View style={[nativeVars, { flex: 1 }]}>{children}</View>
      )}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
