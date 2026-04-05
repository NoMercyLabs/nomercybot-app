import { ScrollView, View } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { PageHeader } from '@/components/layout/PageHeader'

export default function WidgetEditorScreen() {
  const { widgetId } = useLocalSearchParams<{ widgetId: string }>()

  return (
    <ScrollView className="flex-1 bg-surface">
      <PageHeader title="Widget Editor" backHref="/(dashboard)/widgets" />
      <View className="px-6 py-4" />
    </ScrollView>
  )
}
