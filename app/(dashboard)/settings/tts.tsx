import { ScrollView, View } from 'react-native'
import { PageHeader } from '@/components/layout/PageHeader'

export default function TtsSettingsScreen() {
  return (
    <ScrollView className="flex-1" style={{ backgroundColor: '#141125' }}>
      <PageHeader title="Text to Speech" backHref="/(dashboard)/settings" />
      <View className="px-6 py-4" />
    </ScrollView>
  )
}
