import { Stack } from 'expo-router'
import { View } from 'react-native'
import { useAuth } from '@/hooks/useAuth'
import { Redirect } from 'expo-router'

export default function AdminLayout() {
  const { user } = useAuth()
  if (!user?.isAdmin) return <Redirect href="/(dashboard)" />
  return (
    <View className="flex-1" style={{ backgroundColor: '#141125' }}>
      <Stack screenOptions={{ headerShown: false }} />
    </View>
  )
}
