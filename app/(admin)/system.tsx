import { ScrollView, View } from 'react-native'
import { PageHeader } from '@/components/layout/PageHeader'

export default function AdminSystemScreen() {
  return (
    <ScrollView className="flex-1 bg-surface">
      <PageHeader title="System Health" backHref="/(admin)" />
      <View className="px-6 py-4" />
    </ScrollView>
  )
}
