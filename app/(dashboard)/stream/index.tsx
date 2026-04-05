import { ScrollView, View } from 'react-native'
import { PageHeader } from '@/components/layout/PageHeader'

export default function StreamScreen() {
  return (
    <ScrollView className="flex-1 bg-surface">
      <PageHeader title="Stream Info" />
      <View className="px-6 py-4" />
    </ScrollView>
  )
}
