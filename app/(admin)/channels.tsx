import { ScrollView, View } from 'react-native'
import { PageHeader } from '@/components/layout/PageHeader'

export default function AdminChannelsScreen() {
  return (
    <ScrollView className="flex-1 bg-surface">
      <PageHeader title="Channels" backHref="/(admin)" />
      <View className="px-6 py-4" />
    </ScrollView>
  )
}
