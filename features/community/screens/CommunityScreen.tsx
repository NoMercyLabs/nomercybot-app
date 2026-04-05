// Community management is handled by app/(dashboard)/community/index.tsx
import { useEffect } from 'react'
import { View } from 'react-native'
import { router } from 'expo-router'

export function CommunityScreen() {
  useEffect(() => {
    router.replace('/(dashboard)/community' as any)
  }, [])
  return <View className="flex-1 bg-gray-950" />
}
