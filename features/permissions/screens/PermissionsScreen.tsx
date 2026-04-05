// Permissions management is handled by app/(dashboard)/permissions/index.tsx
import { useEffect } from 'react'
import { View } from 'react-native'
import { router } from 'expo-router'

export function PermissionsScreen() {
  useEffect(() => {
    router.replace('/(dashboard)/permissions' as any)
  }, [])
  return <View className="flex-1 bg-gray-950" />
}
