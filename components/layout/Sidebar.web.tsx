import { View, Text, Pressable, ScrollView } from 'react-native'
import { useRouter, usePathname } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '@/stores/useAppStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { useChannelStore } from '@/stores/useChannelStore'
import { apiClient } from '@/lib/api/client'
import { cn } from '@/lib/utils/cn'
import {
  LayoutDashboard, Terminal, Gift, Key,
  MessageSquare, Shield, Radio, Users,
  Music, Layers, Link,
  Zap, CreditCard, Database, Settings,
  ChevronLeft, ChevronRight, ShieldCheck,
  type LucideIcon,
} from 'lucide-react-native'

interface NavItem {
  label: string
  href: string
  Icon: LucideIcon
  badge?: string | number
  isLive?: boolean
}

interface NavSection {
  title: string
  items: NavItem[]
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'BOT',
    items: [
      { label: 'Dashboard', href: '/(dashboard)', Icon: LayoutDashboard, isLive: true },
      { label: 'Commands', href: '/(dashboard)/commands', Icon: Terminal },
      { label: 'Rewards', href: '/(dashboard)/rewards', Icon: Gift },
      { label: 'Permissions', href: '/(dashboard)/permissions', Icon: Key },
    ],
  },
  {
    title: 'CHANNEL',
    items: [
      { label: 'Chat', href: '/(dashboard)/chat', Icon: MessageSquare },
      { label: 'Moderation', href: '/(dashboard)/moderation', Icon: Shield },
      { label: 'Stream Info', href: '/(dashboard)/stream', Icon: Radio },
      { label: 'Community', href: '/(dashboard)/community', Icon: Users },
    ],
  },
  {
    title: 'TOOLS',
    items: [
      { label: 'Music', href: '/(dashboard)/music', Icon: Music },
      { label: 'Widgets', href: '/(dashboard)/widgets', Icon: Layers },
      { label: 'Integrations', href: '/(dashboard)/integrations', Icon: Link },
    ],
  },
  {
    title: 'ACCOUNT',
    items: [
      { label: 'Features', href: '/(dashboard)/features' as any, Icon: Zap },
      { label: 'Billing', href: '/(dashboard)/billing', Icon: CreditCard },
      { label: 'Settings', href: '/(dashboard)/settings', Icon: Settings },
      { label: 'My Data', href: '/(dashboard)/my-data', Icon: Database },
    ],
  },
]

const ADMIN_SECTION: NavSection = {
  title: 'ADMIN',
  items: [
    { label: 'Admin Panel', href: '/(dashboard)/admin', Icon: ShieldCheck },
  ],
}

export function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { sidebarCollapsed, toggleSidebar } = useAppStore()
  const isAdmin = useAuthStore((s) => s.user?.isAdmin)
  const currentChannel = useChannelStore((s) => s.currentChannel)
  const channelId = useChannelStore((s) => s.currentChannel?.id)

  const { data: commandsData } = useQuery<{ data: unknown[] } | unknown[]>({
    queryKey: ['sidebar', 'commands-count', channelId],
    queryFn: () => apiClient.get(`/api/v1/channels/${channelId}/commands`).then((r) => r.data),
    enabled: !!channelId,
    staleTime: 60_000,
  })
  const commandCount = Array.isArray(commandsData) ? commandsData.length
    : Array.isArray((commandsData as any)?.data) ? (commandsData as any).data.length
    : undefined

  const { data: rewardsData } = useQuery<{ data: unknown[] } | unknown[]>({
    queryKey: ['sidebar', 'rewards-count', channelId],
    queryFn: () => apiClient.get(`/api/v1/channels/${channelId}/rewards`).then((r) => r.data),
    enabled: !!channelId,
    staleTime: 60_000,
  })
  const rewardCount = Array.isArray(rewardsData) ? rewardsData.length
    : Array.isArray((rewardsData as any)?.data) ? (rewardsData as any).data.length
    : undefined

  return (
    <View
      className={cn(
        'h-full flex flex-col transition-all duration-200',
        sidebarCollapsed ? 'w-16' : 'w-[240px]',
      )}
      style={{ backgroundColor: '#0F0D1E', borderRightWidth: 1, borderRightColor: '#1e1a35' }}
    >
      {/* Channel avatar + info */}
      {!sidebarCollapsed && (
        <View className="px-3 pt-4 pb-3 gap-1" style={{ borderBottomWidth: 1, borderBottomColor: '#1e1a35' }}>
          <View className="flex-row items-center gap-2.5">
            <View className="h-9 w-9 rounded-full items-center justify-center"
              style={{ backgroundColor: '#7C3AED' }}>
              <Text className="text-xs font-bold text-white">
                {(currentChannel?.displayName ?? 'N').charAt(0).toUpperCase()}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-white" numberOfLines={1}>
                {currentChannel?.displayName ?? 'NomercyBot'}
              </Text>
              {currentChannel?.isLive ? (
                <Text className="text-xs" style={{ color: '#22c55e' }}>
                  {(currentChannel.viewerCount ?? 0).toLocaleString()} viewers
                </Text>
              ) : (
                <Text className="text-xs" style={{ color: '#5a5280' }}>Offline</Text>
              )}
            </View>
          </View>
        </View>
      )}

      {/* Nav sections */}
      <ScrollView className="flex-1 py-2" showsVerticalScrollIndicator={false}>
        {[...NAV_SECTIONS, ...(isAdmin ? [ADMIN_SECTION] : [])].map((section, sectionIndex) => (
          <View key={section.title} className={cn(sectionIndex > 0 && 'mt-3')}>
            {!sidebarCollapsed && (
              <Text
                className="text-xs font-semibold uppercase tracking-widest px-4 py-1.5"
                style={{ color: '#5a5280' }}
              >
                {section.title}
              </Text>
            )}
            {section.items.map((item) => {
              const badge = item.href === '/(dashboard)/commands' ? commandCount
                : item.href === '/(dashboard)/rewards' ? rewardCount
                : item.badge
              const isActive =
                pathname === item.href ||
                (item.href !== '/(dashboard)' && pathname.startsWith(item.href + '/')) ||
                (item.href === '/(dashboard)' && (pathname === '/(dashboard)' || pathname === '/'))
              return (
                <Pressable
                  key={`${section.title}-${item.href}-${item.label}`}
                  onPress={() => router.push(item.href as any)}
                  className={cn(
                    'flex-row items-center gap-2.5 mx-2 px-2.5 py-2 rounded-lg',
                    sidebarCollapsed && 'justify-center',
                  )}
                  style={isActive ? { backgroundColor: 'rgba(124,58,237,0.2)' } : undefined}
                >
                  <item.Icon
                    size={16}
                    color={isActive ? '#8b5cf6' : '#5a5280'}
                  />
                  {!sidebarCollapsed && (
                    <View className="flex-1 flex-row items-center justify-between">
                      <Text
                        className="text-sm"
                        style={{
                          color: isActive ? '#a78bfa' : '#8889a0',
                          fontWeight: isActive ? '600' : '400',
                        }}
                      >
                        {item.label}
                      </Text>
                      <View className="flex-row items-center gap-1.5">
                        {item.isLive && currentChannel?.isLive && (
                          <View
                            className="px-1.5 py-0.5 rounded"
                            style={{ backgroundColor: '#22c55e' }}
                          >
                            <Text className="text-xs font-bold text-white" style={{ fontSize: 9 }}>LIVE</Text>
                          </View>
                        )}
                        {badge != null && (
                          <View
                            className="px-1.5 py-0.5 rounded"
                            style={{ backgroundColor: 'rgba(124,58,237,0.25)' }}
                          >
                            <Text style={{ color: '#a78bfa', fontSize: 10, fontWeight: '600' }}>
                              {badge}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  )}
                </Pressable>
              )
            })}
          </View>
        ))}
      </ScrollView>

      {/* Bottom user + collapse toggle */}
      <View style={{ borderTopWidth: 1, borderTopColor: '#1e1a35' }}>
        {!sidebarCollapsed && (
          <View className="flex-row items-center gap-2 px-3 py-3">
            <View
              className="h-7 w-7 rounded-full items-center justify-center"
              style={{ backgroundColor: '#2e2757' }}
            >
              <Text className="text-xs font-bold" style={{ color: '#8b5cf6' }}>
                {(currentChannel?.displayName ?? 'S').charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text className="flex-1 text-xs font-medium" style={{ color: '#8889a0' }} numberOfLines={1}>
              {currentChannel?.displayName ?? 'Stoney_Eagle'}
            </Text>
            <Pressable onPress={toggleSidebar} className="p-1 rounded-md">
              <ChevronLeft size={14} color="#5a5280" />
            </Pressable>
          </View>
        )}
        {sidebarCollapsed && (
          <Pressable onPress={toggleSidebar} className="items-center justify-center py-3">
            <ChevronRight size={16} color="#5a5280" />
          </Pressable>
        )}
      </View>
    </View>
  )
}
