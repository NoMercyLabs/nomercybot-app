import { View, Text, ScrollView } from 'react-native'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export function MyDataScreen() {
  return (
    <ScrollView className="flex-1 bg-gray-950" contentContainerClassName="p-4 gap-4">
      <PageHeader title="My Data" />
      <Card className="gap-3">
        <Text className="text-sm font-semibold text-white">Data & Privacy</Text>
        <Text className="text-sm text-gray-500">
          You can request an export of all your data or delete your account and associated data.
        </Text>
        <Button variant="outline" size="sm">Request Data Export</Button>
      </Card>
    </ScrollView>
  )
}
