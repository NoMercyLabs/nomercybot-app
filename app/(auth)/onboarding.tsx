import { useState, useEffect } from 'react'
import {
  View,
  Text,
  Pressable,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useAuthStore } from '@/stores/useAuthStore'
import { useChannelStore } from '@/stores/useChannelStore'
import { apiClient } from '@/lib/api/client'
import { Users, Radio } from 'lucide-react-native'

type OnboardingStep = 'loading' | 'choose-role' | 'broadcaster-confirm' | 'mod-search'

export default function OnboardingScreen() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const completeOnboarding = useAuthStore((s) => s.completeOnboarding)
  const fetchChannels = useChannelStore((s) => s.fetchChannels)

  const [step, setStep] = useState<OnboardingStep>('loading')
  const [channelSearch, setChannelSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if user already has channels
  useEffect(() => {
    async function check() {
      try {
        await fetchChannels()
        const channels = useChannelStore.getState().channels
        if (channels.length > 0) {
          completeOnboarding()
          router.replace('/(dashboard)')
          return
        }
      } catch {
        // No channels yet or not authenticated — show onboarding
      }
      setStep('choose-role')
    }
    check()
  }, [completeOnboarding, fetchChannels, router])

  async function handleBroadcasterSetup() {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      await apiClient.post('/api/v1/channels', {
        broadcasterId: user.id,
        displayName: user.displayName,
      })
      await fetchChannels()
      completeOnboarding()
      router.replace('/(dashboard)')
    } catch (e: any) {
      setError(e?.message ?? 'Failed to set up channel.')
    } finally {
      setLoading(false)
    }
  }

  async function handleJoinChannel() {
    const query = channelSearch.trim()
    if (!query) {
      setError('Enter a channel name.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      // Try to join the channel by name/ID
      await apiClient.post(`/api/v1/channels/${encodeURIComponent(query)}/join`)
      await fetchChannels()
      completeOnboarding()
      router.replace('/(dashboard)')
    } catch (e: any) {
      const msg: string =
        e?.response?.data?.message ??
        e?.message ??
        'Channel not found or not using NomercyBot.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  function handleSkip() {
    completeOnboarding()
    router.replace('/(dashboard)')
  }

  if (step === 'loading') {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: '#141125' }}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
      style={{ backgroundColor: '#141125' }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 48 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="items-center gap-3 mb-10">
          <Text className="text-4xl font-bold" style={{ color: '#f4f5fa' }}>
            Welcome{user ? `, ${user.displayName}` : ''}!
          </Text>
          <Text className="text-base text-center leading-relaxed max-w-xs" style={{ color: '#8889a0' }}>
            {step === 'choose-role'
              ? 'How will you be using NomercyBot?'
              : step === 'broadcaster-confirm'
                ? 'Set up the bot for your channel.'
                : 'Join a channel that uses NomercyBot.'}
          </Text>
        </View>

        {/* Role selection */}
        {step === 'choose-role' && (
          <View className="w-full max-w-sm gap-3">
            <Pressable
              onPress={() => setStep('broadcaster-confirm')}
              className="rounded-2xl p-5 flex-row items-center gap-4 active:opacity-80"
              style={{
                backgroundColor: '#1A1530',
                borderWidth: 1,
                borderColor: '#1e1a35',
              }}
            >
              <View
                className="h-12 w-12 rounded-xl items-center justify-center"
                style={{ backgroundColor: 'rgba(124,58,237,0.2)' }}
              >
                <Radio size={24} color="#a78bfa" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold" style={{ color: '#f4f5fa' }}>I'm a broadcaster</Text>
                <Text className="text-sm" style={{ color: '#8889a0' }}>Set up the bot for my own channel</Text>
              </View>
            </Pressable>

            <Pressable
              onPress={() => setStep('mod-search')}
              className="rounded-2xl p-5 flex-row items-center gap-4 active:opacity-80"
              style={{
                backgroundColor: '#1A1530',
                borderWidth: 1,
                borderColor: '#1e1a35',
              }}
            >
              <View
                className="h-12 w-12 rounded-xl items-center justify-center"
                style={{ backgroundColor: 'rgba(59,130,246,0.2)' }}
              >
                <Users size={24} color="#60a5fa" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold" style={{ color: '#f4f5fa' }}>I'm a viewer / mod</Text>
                <Text className="text-sm" style={{ color: '#8889a0' }}>Join a channel that uses NomercyBot</Text>
              </View>
            </Pressable>
          </View>
        )}

        {/* Broadcaster: auto-setup */}
        {step === 'broadcaster-confirm' && (
          <View
            className="w-full max-w-sm rounded-2xl p-6 gap-4"
            style={{ backgroundColor: '#1A1530', borderWidth: 1, borderColor: '#1e1a35' }}
          >
            <View className="items-center gap-2">
              <Text className="text-lg font-semibold" style={{ color: '#f4f5fa' }}>
                {user?.displayName ?? 'Your channel'}
              </Text>
              <Text className="text-sm text-center" style={{ color: '#8889a0' }}>
                The bot will be set up for your Twitch channel automatically.
              </Text>
            </View>

            {error && (
              <View
                className="rounded-xl px-4 py-3"
                style={{
                  backgroundColor: 'rgba(239,68,68,0.1)',
                  borderWidth: 1,
                  borderColor: 'rgba(239,68,68,0.3)',
                }}
              >
                <Text className="text-sm" style={{ color: '#f87171' }}>{error}</Text>
              </View>
            )}

            <Pressable
              onPress={handleBroadcasterSetup}
              disabled={loading}
              className="w-full rounded-xl py-4 items-center active:opacity-80"
              style={{ backgroundColor: '#7C3AED', opacity: loading ? 0.5 : 1 }}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text className="font-semibold text-base text-white">Set up my channel</Text>
              )}
            </Pressable>

            <Pressable
              onPress={() => { setStep('choose-role'); setError(null) }}
              className="w-full rounded-xl py-3 items-center active:opacity-80"
              style={{ backgroundColor: '#141125' }}
            >
              <Text className="font-medium" style={{ color: '#8889a0' }}>Back</Text>
            </Pressable>
          </View>
        )}

        {/* Moderator: search for channel */}
        {step === 'mod-search' && (
          <View
            className="w-full max-w-sm rounded-2xl p-6 gap-4"
            style={{ backgroundColor: '#1A1530', borderWidth: 1, borderColor: '#1e1a35' }}
          >
            <View className="gap-1">
              <Text className="text-lg font-semibold" style={{ color: '#f4f5fa' }}>Join a channel</Text>
              <Text className="text-sm" style={{ color: '#8889a0' }}>
                Enter the Twitch channel name you want to join.
              </Text>
            </View>

            <TextInput
              value={channelSearch}
              onChangeText={(t) => { setChannelSearch(t); setError(null) }}
              placeholder="e.g. stoney_eagle"
              placeholderTextColor="#3d3566"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleJoinChannel}
              className="w-full rounded-xl px-4 py-3 text-base"
              style={{
                backgroundColor: '#141125',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.1)',
                color: '#f4f5fa',
                outlineStyle: 'none',
              } as any}
            />

            {error && (
              <View
                className="rounded-xl px-4 py-3"
                style={{
                  backgroundColor: 'rgba(239,68,68,0.1)',
                  borderWidth: 1,
                  borderColor: 'rgba(239,68,68,0.3)',
                }}
              >
                <Text className="text-sm" style={{ color: '#f87171' }}>{error}</Text>
              </View>
            )}

            <Pressable
              onPress={handleJoinChannel}
              disabled={loading}
              className="w-full rounded-xl py-4 items-center active:opacity-80"
              style={{ backgroundColor: '#3b82f6', opacity: loading ? 0.5 : 1 }}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text className="font-semibold text-base text-white">Join channel</Text>
              )}
            </Pressable>

            <Pressable
              onPress={() => { setStep('choose-role'); setError(null) }}
              className="w-full rounded-xl py-3 items-center active:opacity-80"
              style={{ backgroundColor: '#141125' }}
            >
              <Text className="font-medium" style={{ color: '#8889a0' }}>Back</Text>
            </Pressable>
          </View>
        )}

        {/* Skip */}
        <Pressable
          onPress={handleSkip}
          className="mt-8 px-4 py-2 active:opacity-60"
        >
          <Text className="text-sm underline" style={{ color: '#5a5280' }}>Skip for now</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
