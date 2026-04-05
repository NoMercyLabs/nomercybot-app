import { ScrollView, View, Text } from 'react-native'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

const INTEGRATIONS = [
  { name: 'Twitch', description: 'Chat bot, EventSub, Helix API', connected: true },
  { name: 'Discord', description: 'Notifications and commands', connected: false },
  { name: 'Spotify', description: 'Now playing and song requests', connected: false },
  { name: 'OBS Studio', description: 'Scene switching and overlays', connected: false },
]

export default function IntegrationsScreen() {
  return (
    <ScrollView className="flex-1 bg-surface">
      <PageHeader title="Integrations" />
      <View className="px-6 py-4 gap-3">
        {INTEGRATIONS.map((integration) => (
          <Card key={integration.name} className="flex-row items-center justify-between p-4">
            <View className="gap-1">
              <Text className="text-gray-100 font-medium">{integration.name}</Text>
              <Text className="text-gray-500 text-xs">{integration.description}</Text>
            </View>
            <Badge
              label={integration.connected ? 'Connected' : 'Not connected'}
              variant={integration.connected ? 'success' : 'secondary'}
            />
          </Card>
        ))}
      </View>
    </ScrollView>
  )
}
