import { ScrollView, View } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { PageHeader } from '@/components/layout/PageHeader'

export default function ViewerDetailScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>()
  return (
    <ScrollView className="flex-1 bg-surface">
      <PageHeader title="Viewer" backHref="/(dashboard)/community" />
      <View className="px-6 py-4" />
    </ScrollView>
  )
}
