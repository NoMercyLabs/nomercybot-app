import { View, Text, ScrollView, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuthStore } from '@/stores/useAuthStore'
import {
  Gift, Key, Shield, Radio, Users,
  Music, Layers, Link, Zap, CreditCard,
  Database, Timer, Workflow, ShieldCheck,
  Settings, ChevronRight,
  type LucideIcon,
} from 'lucide-react-native'

interface NavItem {
  label: string
  href: string
  Icon: LucideIcon
  color: string
}

const MORE_SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: 'Bot',
    items: [
      { label: 'Rewards', href: '/(dashboard)/rewards', Icon: Gift, color: '#a78bfa' },
      { label: 'Permissions', href: '/(dashboard)/permissions', Icon: Key, color: '#60a5fa' },
      { label: 'Timers', href: '/(dashboard)/timers', Icon: Timer, color: '#4ade80' },
      { label: 'Pipelines', href: '/(dashboard)/pipelines', Icon: Workflow, color: '#f59e0b' },
    ],
  },
  {
    title: 'Channel',
    items: [
      { label: 'Moderation', href: '/(dashboard)/moderation', Icon: Shield, color: '#ef4444' },
      { label: 'Stream Info', href: '/(dashboard)/stream', Icon: Radio, color: '#f87171' },
      { label: 'Community', href: '/(dashboard)/community', Icon: Users, color: '#34d399' },
      { label: 'Event Responses', href: '/(dashboard)/event-responses', Icon: Zap, color: '#fbbf24' },
    ],
  },
  {
    title: 'Tools',
    items: [
      { label: 'Widgets', href: '/(dashboard)/widgets', Icon: Layers, color: '#a78bfa' },
      { label: 'Integrations', href: '/(dashboard)/integrations', Icon: Link, color: '#60a5fa' },
    ],
  },
  {
    title: 'Account',
    items: [
      { label: 'Features', href: '/(dashboard)/features', Icon: Zap, color: '#fbbf24' },
      { label: 'Billing', href: '/(dashboard)/billing', Icon: CreditCard, color: '#4ade80' },
      { label: 'My Data', href: '/(dashboard)/my-data', Icon: Database, color: '#94a3b8' },
      { label: 'Settings', href: '/(dashboard)/settings', Icon: Settings, color: '#8b5cf6' },
    ],
  },
]

export function MobileMoreScreen() {
  const router = useRouter()
  const isAdmin = useAuthStore((s) => s.user?.isAdmin)

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#141125' }}
      contentContainerStyle={{ paddingBottom: 80 }}
    >
      <View
        className="px-5 pt-5 pb-3"
        style={{ borderBottomWidth: 1, borderBottomColor: '#1e1a35' }}
      >
        <Text className="text-xl font-bold text-white">More</Text>
        <Text className="text-xs mt-0.5" style={{ color: '#5a5280' }}>
          All features and settings
        </Text>
      </View>

      <View className="px-4 py-3 gap-5">
        {[
          ...MORE_SECTIONS,
          ...(isAdmin ? [{
            title: 'Admin',
            items: [{ label: 'Admin Panel', href: '/(dashboard)/admin', Icon: ShieldCheck, color: '#ef4444' }],
          }] : []),
        ].map((section) => (
          <View key={section.title} className="gap-1.5">
            <Text
              className="text-xs font-semibold uppercase tracking-wider px-1 mb-1"
              style={{ color: '#5a5280' }}
            >
              {section.title}
            </Text>
            <View
              className="rounded-xl overflow-hidden"
              style={{ backgroundColor: '#1A1530', borderWidth: 1, borderColor: '#1e1a35' }}
            >
              {section.items.map((item, i) => (
                <Pressable
                  key={item.href}
                  onPress={() => router.push(item.href as any)}
                  className="flex-row items-center gap-3 px-4"
                  style={[
                    { minHeight: 52 },
                    i > 0 ? { borderTopWidth: 1, borderTopColor: '#1e1a35' } : undefined,
                  ]}
                >
                  <View
                    className="h-8 w-8 rounded-lg items-center justify-center"
                    style={{ backgroundColor: `${item.color}20` }}
                  >
                    <item.Icon size={16} color={item.color} />
                  </View>
                  <Text className="flex-1 text-sm font-medium text-white">
                    {item.label}
                  </Text>
                  <ChevronRight size={16} color="#3d3566" />
                </Pressable>
              ))}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  )
}
