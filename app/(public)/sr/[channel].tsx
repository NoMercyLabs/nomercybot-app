import { ScrollView, View, Text } from 'react-native'
import { useLocalSearchParams } from 'expo-router'

export default function SongRequestScreen() {
  const { channel } = useLocalSearchParams<{ channel: string }>()

  return (
    <ScrollView className="flex-1 bg-surface">
      <View className="px-6 py-8 items-center gap-4">
        <Text className="text-2xl font-bold text-gray-100">Song Request</Text>
        <Text className="text-gray-400">Channel: {channel}</Text>
      </View>
    </ScrollView>
  )
}
