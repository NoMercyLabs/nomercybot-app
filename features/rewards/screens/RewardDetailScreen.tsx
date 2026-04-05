import { View, Text, ScrollView } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'

export function RewardDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  return (
    <ScrollView className="flex-1 bg-gray-950" contentContainerClassName="p-4 gap-4">
      <PageHeader title="Reward" showBack />
      <Card>
        <Text className="text-sm text-gray-500">Reward {id} details coming soon.</Text>
      </Card>
    </ScrollView>
  )
}
