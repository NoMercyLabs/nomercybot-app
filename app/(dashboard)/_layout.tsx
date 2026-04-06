import { useEffect } from 'react'
import { Platform } from 'react-native'
import { Redirect, Tabs, Slot } from 'expo-router'
import { useAuth } from '@/hooks/useAuth'
import { useChannel } from '@/hooks/useChannel'
import { useBreakpoint } from '@/hooks/useBreakpoint'
import { useRealtimeChannel } from '@/hooks/useRealtimeChannel'
import { useAppStore } from '@/stores/useAppStore'
import { Sidebar } from '@/components/layout/Sidebar'
import { ChannelSwitcher } from '@/components/layout/ChannelSwitcher'
import { ConnectionStatus } from '@/components/layout/ConnectionStatus'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { View } from 'react-native'
import {
  LayoutDashboard,
  Terminal,
  MessageSquare,
  Music,
  Settings,
} from 'lucide-react-native'

export default function DashboardLayout() {
  const { isAuthenticated, isLoading } = useAuth()
  const { currentChannel } = useChannel()
  const { isDesktop, isTablet } = useBreakpoint()
  const { setSidebarCollapsed } = useAppStore()

  useRealtimeChannel()

  // Spec: tablet sidebar starts collapsed on mount
  useEffect(() => {
    if (isTablet && !isDesktop) {
      setSidebarCollapsed(true)
    }
  }, [isTablet, isDesktop, setSidebarCollapsed])

  if (isLoading) return null

  if (!isAuthenticated) return <Redirect href="/(auth)/login" />
  if (!currentChannel) return <Redirect href="/(auth)/onboarding" />

  // Web: full sidebar dashboard
  // Tablet: collapsible sidebar (no bottom tabs)
  if (isDesktop || isTablet) {
    return (
      <View className="flex-1 flex-row" style={{ backgroundColor: '#0D0B1A' }}>
        <Sidebar />
        <View
          className="flex-1"
          style={{
            backgroundColor: '#141125',
            minWidth: 0,
            // Prevent content wider than viewport from causing character-by-character text wrap
            ...(Platform.OS === 'web' ? { overflowX: 'hidden' } as any : {}),
          }}
        >
          <View
            className="flex-row items-center justify-between px-6 py-3"
            style={{ borderBottomWidth: 1, borderBottomColor: '#1e1a35' }}
          >
            <ChannelSwitcher />
            <ConnectionStatus />
          </View>
          <ErrorBoundary>
            <Slot />
          </ErrorBoundary>
        </View>
      </View>
    )
  }

  // Phone: bottom tabs with 5 key tabs
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0F0D1E',
          borderTopColor: '#1e1a35',
        },
        tabBarActiveTintColor: '#8b5cf6',
        tabBarInactiveTintColor: '#5a5280',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Dashboard', tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="commands"
        options={{ title: 'Commands', tabBarIcon: ({ color, size }) => <Terminal color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="chat"
        options={{ title: 'Chat', tabBarIcon: ({ color, size }) => <MessageSquare color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="music"
        options={{ title: 'Music', tabBarIcon: ({ color, size }) => <Music color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: 'More', tabBarIcon: ({ color, size }) => <Settings color={color} size={size} /> }}
      />
      <Tabs.Screen name="rewards" options={{ href: null }} />
      <Tabs.Screen name="moderation" options={{ href: null }} />
      <Tabs.Screen name="widgets" options={{ href: null }} />
      <Tabs.Screen name="stream" options={{ href: null }} />
      <Tabs.Screen name="community" options={{ href: null }} />
      <Tabs.Screen name="pipelines" options={{ href: null }} />
      <Tabs.Screen name="integrations" options={{ href: null }} />
      <Tabs.Screen name="permissions" options={{ href: null }} />
      <Tabs.Screen name="billing" options={{ href: null }} />
      <Tabs.Screen name="features" options={{ href: null }} />
      <Tabs.Screen name="timers" options={{ href: null }} />
      <Tabs.Screen name="my-data" options={{ href: null }} />
      <Tabs.Screen name="event-responses" options={{ href: null }} />
      <Tabs.Screen name="admin" options={{ href: null }} />
    </Tabs>
  )
}
