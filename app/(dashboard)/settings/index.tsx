import { ScrollView, View, Text } from 'react-native'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { useRouter } from 'expo-router'
import { Pressable } from 'react-native'
import { Volume2, AlertTriangle, ChevronRight } from 'lucide-react-native'

export default function SettingsScreen() {
  const router = useRouter()

  const sections = [
    { title: 'Text to Speech', icon: <Volume2 size={18} color="rgb(156,163,175)" />, href: '/(dashboard)/settings/tts' },
    { title: 'Danger Zone', icon: <AlertTriangle size={18} color="rgb(239,68,68)" />, href: '/(dashboard)/settings/danger' },
  ]

  return (
    <ScrollView className="flex-1 bg-surface">
      <PageHeader title="Settings" />
      <View className="px-6 py-4 gap-3">
        {sections.map((s) => (
          <Pressable key={s.title} onPress={() => router.push(s.href as any)}>
            <Card className="flex-row items-center gap-4 p-4">
              {s.icon}
              <Text className="flex-1 text-gray-100 font-medium">{s.title}</Text>
              <ChevronRight size={16} color="rgb(107,114,128)" />
            </Card>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  )
}
