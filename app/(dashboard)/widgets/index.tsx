import { ScrollView, View, Text, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { PageHeader } from '@/components/layout/PageHeader'
import { useApiQuery } from '@/hooks/useApi'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { Badge } from '@/components/ui/Badge'

interface Widget {
  id: string
  name: string
  type: string
  enabled: boolean
}

export default function WidgetsScreen() {
  const router = useRouter()
  const { data: widgets, isLoading } = useApiQuery<Widget[]>('widgets', '/widgets')

  return (
    <ScrollView className="flex-1" style={{ backgroundColor: '#141125' }}>
      <PageHeader title="Widgets" />
      <View className="px-6 py-4 gap-3">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)
          : widgets?.map((w) => (
              <Pressable key={w.id} onPress={() => router.push(`/(dashboard)/widgets/${w.id}` as any)}>
                <Card className="flex-row items-center justify-between p-4">
                  <View className="gap-1">
                    <Text className="font-medium" style={{ color: '#f4f5fa' }}>{w.name}</Text>
                    <Text className="text-xs" style={{ color: '#6b7280' }}>{w.type}</Text>
                  </View>
                  <Badge label={w.enabled ? 'Active' : 'Disabled'} variant={w.enabled ? 'success' : 'secondary'} />
                </Card>
              </Pressable>
            ))}
      </View>
    </ScrollView>
  )
}
