import { useEffect, useState } from 'react'
import { View, Text, Pressable } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/useAuthStore'
import { Skeleton } from '@/components/ui/Skeleton'

export default function CallbackScreen() {
  const router = useRouter()
  const { t } = useTranslation('common')
  const params = useLocalSearchParams<{
    access_token?: string
    refresh_token?: string
    expires_in?: string
    code?: string
    state?: string
    token?: string
    scope?: string
    error?: string
    error_description?: string
  }>()

  const handleCallback = useAuthStore((s) => s.handleCallback)
  const onboardingComplete = useAuthStore((s) => s.onboardingComplete)

  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    async function processCallback() {
      if (params.error) {
        const desc = params.error_description
          ? decodeURIComponent(params.error_description.replace(/\+/g, ' '))
          : params.error
        setErrorMessage(desc)
        return
      }

      if (!params.access_token && !params.token && !params.code) {
        setErrorMessage('No authentication data received.')
        return
      }

      const success = await handleCallback({
        access_token: params.access_token,
        refresh_token: params.refresh_token,
        expires_in: params.expires_in,
        token: params.token,
        code: params.code,
        state: params.state,
        scopes: params.scope,
      })

      if (success) {
        if (onboardingComplete) {
          router.replace('/(dashboard)')
        } else {
          router.replace('/(auth)/onboarding')
        }
      } else {
        setErrorMessage('Authentication failed. Please try again.')
      }
    }

    processCallback()
  }, [handleCallback, onboardingComplete, params.access_token, params.code, params.error, params.error_description, params.expires_in, params.refresh_token, params.scope, params.state, params.token, router])

  if (errorMessage) {
    return (
      <View className="flex-1 items-center justify-center px-6 gap-6" style={{ backgroundColor: '#141125' }}>
        <View className="w-full max-w-sm items-center gap-4">
          <Text className="text-2xl font-bold" style={{ color: '#f4f5fa' }}>Sign in failed</Text>
          <View
            className="w-full rounded-xl px-4 py-3"
            style={{
              backgroundColor: 'rgba(239,68,68,0.1)',
              borderWidth: 1,
              borderColor: 'rgba(239,68,68,0.3)',
            }}
          >
            <Text className="text-sm text-center" style={{ color: '#f87171' }}>{errorMessage}</Text>
          </View>
          <Pressable
            onPress={() => router.replace('/(auth)/login')}
            className="w-full rounded-xl py-4 items-center active:opacity-80"
            style={{ backgroundColor: '#1A1530' }}
          >
            <Text className="font-semibold" style={{ color: '#f4f5fa' }}>Back to Login</Text>
          </Pressable>
        </View>
      </View>
    )
  }

  return (
    <View className="flex-1 items-center justify-center gap-6" style={{ backgroundColor: '#141125' }}>
      <View className="gap-3 items-center">
        <Skeleton className="h-12 w-12 rounded-full" />
        <Skeleton className="h-4 w-40 rounded-lg" />
      </View>
      <Text className="text-sm" style={{ color: '#8889a0' }}>{t('auth.signingIn', 'Signing you in...')}</Text>
    </View>
  )
}
