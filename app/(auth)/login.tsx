import { View, Text } from 'react-native'
import { useTranslation } from 'react-i18next'
import { TwitchLoginButton } from '@/features/auth/components/TwitchLoginButton'
import { useTwitchOAuth } from '@/features/auth/hooks/useTwitchOAuth'

export default function LoginScreen() {
  const { login, isLoading, error } = useTwitchOAuth()
  const { t } = useTranslation('common')

  return (
    <View className="flex-1 items-center justify-center px-6" style={{ backgroundColor: '#141125' }}>
      <View className="w-full max-w-sm items-center gap-8">
        {/* Branding */}
        <View className="items-center gap-3">
          <View
            className="w-20 h-20 rounded-2xl items-center justify-center"
            style={{ backgroundColor: '#1A1530' }}
          >
            <Text className="text-4xl">🤖</Text>
          </View>
          <Text className="text-3xl font-bold tracking-tight" style={{ color: '#f4f5fa' }}>NomercyBot</Text>
          <Text className="text-center text-base leading-relaxed" style={{ color: '#8889a0' }}>
            {t('auth.loginSubtitle', 'Your all-in-one Twitch stream bot.\nAutomate, moderate, and engage.')}
          </Text>
        </View>

        {/* Login area */}
        <View className="w-full gap-4">
          <TwitchLoginButton onPress={login} isLoading={isLoading} />

          {error ? (
            <View
              className="rounded-xl px-4 py-3"
              style={{
                backgroundColor: 'rgba(239,68,68,0.1)',
                borderWidth: 1,
                borderColor: 'rgba(239,68,68,0.3)',
              }}
            >
              <Text className="text-sm text-center" style={{ color: '#f87171' }}>{error}</Text>
            </View>
          ) : null}
        </View>

        {/* Footer */}
        <Text className="text-xs text-center" style={{ color: '#5a5280' }}>
          {t('auth.termsPrivacy', 'By signing in, you agree to our Terms of Service and Privacy Policy.')}
        </Text>
      </View>
    </View>
  )
}
