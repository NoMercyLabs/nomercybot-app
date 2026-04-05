import { View, Text, ScrollView } from 'react-native'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'

export function WidgetsScreen() {
  return (
    <ScrollView className="flex-1 bg-gray-950" contentContainerClassName="p-4 gap-4">
      <PageHeader title="Widgets" />
      <Card>
        <Text className="text-sm text-gray-500">Widget editor available on web dashboard.</Text>
      </Card>
    </ScrollView>
  )
}
