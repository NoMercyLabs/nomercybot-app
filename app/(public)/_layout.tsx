import { Stack } from 'expo-router'
import { View } from 'react-native'

export default function PublicLayout() {
  return (
    <View className="flex-1 bg-surface">
      <Stack screenOptions={{ headerShown: false }} />
    </View>
  )
}
