import { ScrollView, View, Text, Pressable } from 'react-native'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { AlertTriangle } from 'lucide-react-native'

export default function DangerZoneScreen() {
  return (
    <ScrollView className="flex-1 bg-surface">
      <PageHeader title="Danger Zone" backHref="/(dashboard)/settings" />
      <View className="px-6 py-4 gap-4">
        <Card className="border border-red-900 p-4 gap-4">
          <View className="flex-row items-center gap-3">
            <AlertTriangle size={20} color="rgb(239,68,68)" />
            <Text className="text-red-400 font-semibold">Destructive Actions</Text>
          </View>
          <Pressable className="rounded-lg border border-red-700 py-3 items-center">
            <Text className="text-red-400 font-medium">Reset Bot Configuration</Text>
          </Pressable>
          <Pressable className="rounded-lg bg-red-700 py-3 items-center">
            <Text className="text-white font-medium">Delete Account</Text>
          </Pressable>
        </Card>
      </View>
    </ScrollView>
  )
}
