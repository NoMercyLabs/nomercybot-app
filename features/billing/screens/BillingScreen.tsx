import { View, Text, ScrollView } from 'react-native'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'

export function BillingScreen() {
  return (
    <ScrollView className="flex-1 bg-gray-950" contentContainerClassName="p-4 gap-4">
      <PageHeader title="Billing" />
      <Card>
        <Text className="text-sm text-gray-500">Billing management coming soon.</Text>
      </Card>
    </ScrollView>
  )
}
