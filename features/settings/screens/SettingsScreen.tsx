import { View, Text, ScrollView, RefreshControl, Pressable, TextInput } from 'react-native'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/useAuthStore'
import { useChannelStore } from '@/stores/useChannelStore'
import { useThemeStore } from '@/stores/useThemeStore'
import { useBreakpoint } from '@/hooks/useBreakpoint'
import { PageHeader } from '@/components/layout/PageHeader'
import { Toggle } from '@/components/ui/Toggle'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Skeleton } from '@/components/ui/Skeleton'
import { ColorPicker } from '@/components/ui/ColorPicker'
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary'
import { useToast } from '@/hooks/useToast'
import { useTranslation } from 'react-i18next'
import { loadNamespace } from '@/lib/i18n/resources'
import { LogOut, AlertTriangle, Copy } from 'lucide-react-native'
import { useSettings } from '../hooks/useSettings'
import { settingsApi } from '../api'
import { FEATURE_KEYS } from '../types'

const LANGUAGES = [
  { label: 'English', value: 'en' },
  { label: 'Nederlands', value: 'nl' },
  { label: 'Deutsch', value: 'de' },
]

const ALERT_DURATIONS = [
  { label: '3 seconds', value: '3' },
  { label: '5 seconds', value: '5' },
  { label: '10 seconds', value: '10' },
]

const SETTINGS_TABS = [
  { key: 'general', label: 'General' },
  { key: 'bot', label: 'Bot Config' },
  { key: 'overlay', label: 'Overlay' },
  { key: 'notifications', label: 'Notifications' },
  { key: 'appearance', label: 'Appearance' },
  { key: 'danger', label: 'Danger Zone' },
]

function SettingRow({
  label,
  description,
  control,
}: {
  label: string
  description?: string
  control: React.ReactNode
}) {
  return (
    <View
      className="flex-row items-center justify-between py-4"
      style={{ borderBottomWidth: 1, borderBottomColor: '#1e1a35' }}
    >
      <View className="flex-1 mr-4 gap-0.5">
        <Text className="text-sm font-medium text-white">{label}</Text>
        {description && (
          <Text className="text-xs" style={{ color: '#5a5280' }}>{description}</Text>
        )}
      </View>
      {control}
    </View>
  )
}

function SectionCard({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <View
      className="rounded-xl px-4"
      style={{ backgroundColor: '#1A1530', borderWidth: 1, borderColor: '#1e1a35' }}
    >
      {title && (
        <View className="pt-4 pb-2">
          <Text className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#5a5280' }}>
            {title}
          </Text>
        </View>
      )}
      {children}
    </View>
  )
}

function InlineInput({
  value,
  onChangeText,
  placeholder,
  width,
}: {
  value: string
  onChangeText: (v: string) => void
  placeholder?: string
  width?: number
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#3d3566"
      className="text-sm text-white rounded-lg px-3 py-2"
      style={{
        backgroundColor: '#231D42',
        borderWidth: 1,
        borderColor: '#1e1a35',
        width: width ?? 180,
        outlineStyle: 'none',
      } as any}
    />
  )
}

const NOTIFICATION_PREFS = [
  { key: 'follows', label: 'New Followers', description: 'Get notified when someone follows' },
  { key: 'subscribers', label: 'New Subscribers', description: 'Get notified when someone subscribes' },
  { key: 'raids', label: 'Raids', description: 'Get notified when someone raids' },
  { key: 'cheers', label: 'Cheers', description: 'Get notified for bit cheers' },
  { key: 'redemptions', label: 'Reward Redemptions', description: 'Get notified for channel point redemptions' },
]

export function SettingsScreen() {
  const { i18n } = useTranslation()
  const [tab, setTab] = useState('general')
  const toast = useToast()
  const logout = useAuthStore((s) => s.logout)
  const channelId = useChannelStore((s) => s.currentChannel?.id)
  const queryClient = useQueryClient()
  const { isDark, toggleTheme, accentOverride, setAccent } = useThemeStore()
  const { isDesktop } = useBreakpoint()

  const [botUsername, setBotUsername] = useState('')
  const [botPrefix, setBotPrefix] = useState('!')
  const [showAlerts, setShowAlerts] = useState(true)
  const [alertDuration, setAlertDuration] = useState('5')
  const [whisperResponses, setWhisperResponses] = useState(false)

  const { data: notifPrefs = {} } = useQuery<Record<string, boolean>>({
    queryKey: ['channel', channelId, 'notification-prefs'],
    queryFn: () => settingsApi.getNotificationPrefs(channelId!),
    enabled: !!channelId && tab === 'notifications',
  })

  const notifMutation = useMutation({
    mutationFn: (prefs: Record<string, boolean>) =>
      settingsApi.updateNotificationPrefs(channelId!, prefs),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channel', channelId, 'notification-prefs'] })
      toast.success('Notification preferences saved')
    },
    onError: () => toast.error('Failed to save notification preferences'),
  })

  const {
    channel,
    isLoading,
    isRefetching,
    refetch,
    updateChannel,
    toggleFeature,
    isFeatureEnabled,
  } = useSettings()

  async function handleLocaleChange(locale: string) {
    try {
      await updateChannel({ locale })
      await loadNamespace(locale as any, 'common')
      await i18n.changeLanguage(locale)
    } catch {
      toast.error('Failed to save language')
    }
  }

  async function handleToggleFeature(key: string) {
    try {
      await toggleFeature(key)
    } catch {
      toast.error('Failed to update feature')
    }
  }

  const tabContent = (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
    >
      {tab === 'general' && (
        <View className="gap-4">
          <SectionCard title="Bot Configuration">
            <SettingRow
              label="Bot Username"
              description="The username of your bot account"
              control={
                <InlineInput
                  value={botUsername || channel?.name || ''}
                  onChangeText={setBotUsername}
                  placeholder="e.g. MyBot"
                />
              }
            />
            <SettingRow
              label="Bot Prefix"
              description="Character prefix for commands"
              control={
                <InlineInput
                  value={botPrefix}
                  onChangeText={setBotPrefix}
                  placeholder="!"
                  width={60}
                />
              }
            />
            <SettingRow
              label="Language"
              description="Language used throughout the app"
              control={
                <Select
                  value={i18n.language}
                  onValueChange={async (v) => {
                    await loadNamespace(v as any, 'common')
                    await i18n.changeLanguage(v)
                  }}
                  options={LANGUAGES}
                />
              }
            />
            <SettingRow
              label="Auto-join Chat"
              description="Bot automatically joins chat when you go live"
              control={
                <Toggle
                  value={isFeatureEnabled('auto_join')}
                  onValueChange={() => handleToggleFeature('auto_join')}
                />
              }
            />
            <SettingRow
              label="Whisper Responses"
              description="Send command responses via whisper instead of chat"
              control={
                <Toggle
                  value={whisperResponses}
                  onValueChange={setWhisperResponses}
                />
              }
            />
          </SectionCard>
        </View>
      )}

      {tab === 'bot' && (
        <>
          {isLoading ? (
            <View className="gap-4">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
            </View>
          ) : (
            <>
              <SectionCard title="Language">
                <SettingRow
                  label="Bot Language"
                  description="Language for bot responses"
                  control={
                    <Select
                      value={channel?.language ?? 'en'}
                      onValueChange={handleLocaleChange}
                      options={LANGUAGES}
                    />
                  }
                />
              </SectionCard>

              <SectionCard title="Features">
                <SettingRow
                  label="Moderation"
                  description="Enable automated moderation features"
                  control={
                    <Toggle
                      value={isFeatureEnabled(FEATURE_KEYS.MODERATION)}
                      onValueChange={() => handleToggleFeature(FEATURE_KEYS.MODERATION)}
                    />
                  }
                />
                <SettingRow
                  label="Music"
                  description="Enable music queue and controls"
                  control={
                    <Toggle
                      value={isFeatureEnabled(FEATURE_KEYS.MUSIC)}
                      onValueChange={() => handleToggleFeature(FEATURE_KEYS.MUSIC)}
                    />
                  }
                />
                <SettingRow
                  label="Pipelines"
                  description="Enable automation pipelines"
                  control={
                    <Toggle
                      value={isFeatureEnabled(FEATURE_KEYS.PIPELINES)}
                      onValueChange={() => handleToggleFeature(FEATURE_KEYS.PIPELINES)}
                    />
                  }
                />
                <SettingRow
                  label="Text-to-Speech"
                  description="Read chat messages aloud via TTS"
                  control={
                    <Toggle
                      value={isFeatureEnabled(FEATURE_KEYS.TTS)}
                      onValueChange={() => handleToggleFeature(FEATURE_KEYS.TTS)}
                    />
                  }
                />
              </SectionCard>
            </>
          )}
        </>
      )}

      {tab === 'overlay' && (
        <SectionCard title="Overlay">
          <SettingRow
            label="Overlay Token"
            description="Use this token in your browser source URL"
            control={
              <View className="flex-row items-center gap-2">
                <Text className="text-sm font-mono" style={{ color: '#8889a0' }}>
                  ••••••••••••
                </Text>
                <Pressable
                  className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-lg"
                  style={{ backgroundColor: '#231D42', borderWidth: 1, borderColor: '#1e1a35' }}
                  onPress={() => toast.success('Token copied')}
                >
                  <Copy size={12} color="#8889a0" />
                  <Text className="text-xs font-medium" style={{ color: '#8889a0' }}>Copy</Text>
                </Pressable>
              </View>
            }
          />
          <SettingRow
            label="Show Alerts"
            description="Display follower and subscriber alerts in the overlay"
            control={
              <Toggle value={showAlerts} onValueChange={setShowAlerts} />
            }
          />
          <SettingRow
            label="Alert Duration"
            description="How long each alert is displayed"
            control={
              <Select
                value={alertDuration}
                onValueChange={setAlertDuration}
                options={ALERT_DURATIONS}
              />
            }
          />
        </SectionCard>
      )}

      {tab === 'notifications' && (
        <SectionCard title="Notification Preferences">
          {NOTIFICATION_PREFS.map((pref) => (
            <SettingRow
              key={pref.key}
              label={pref.label}
              description={pref.description}
              control={
                <Toggle
                  value={notifPrefs[pref.key] ?? true}
                  onValueChange={(v) => {
                    const updated = { ...notifPrefs, [pref.key]: v }
                    notifMutation.mutate(updated)
                  }}
                />
              }
            />
          ))}
        </SectionCard>
      )}

      {tab === 'appearance' && (
        <>
          <SectionCard title="Theme">
            <SettingRow
              label="Dark Mode"
              description="Use dark interface theme"
              control={<Toggle value={isDark} onValueChange={toggleTheme} />}
            />
          </SectionCard>

          <SectionCard title="Accent Color">
            <View className="py-4">
              <Text className="text-xs mb-3" style={{ color: '#5a5280' }}>
                Set your brand color — used for highlights, buttons, and indicators.
              </Text>
              <ColorPicker value={accentOverride ?? '#7C3AED'} onValueChange={setAccent} />
            </View>
          </SectionCard>
        </>
      )}

      {tab === 'danger' && (
        <View
          className="rounded-xl p-4 gap-4"
          style={{
            backgroundColor: 'rgba(239,68,68,0.05)',
            borderWidth: 1,
            borderColor: 'rgba(239,68,68,0.3)',
          }}
        >
          <View className="flex-row items-center gap-2">
            <AlertTriangle size={16} color="#ef4444" />
            <Text className="text-sm font-semibold" style={{ color: '#ef4444' }}>
              Danger Zone
            </Text>
          </View>
          <Text className="text-xs" style={{ color: '#8889a0' }}>
            These actions are irreversible. Please proceed with caution.
          </Text>

          <View style={{ borderTopWidth: 1, borderTopColor: 'rgba(239,68,68,0.2)' }}>
            <SettingRow
              label="Sign Out"
              description="Sign out of your account on this device"
              control={
                <Button
                  variant="outline"
                  size="sm"
                  onPress={logout}
                  leftIcon={<LogOut size={14} color="#9ca3af" />}
                  label="Sign Out"
                />
              }
            />
            <SettingRow
              label="Deactivate Bot"
              description="Temporarily remove the bot from your channel"
              control={
                <Button variant="danger" size="sm" label="Deactivate" />
              }
            />
            <View className="py-4">
              <Text className="text-sm font-medium" style={{ color: '#ef4444' }}>Delete Channel</Text>
              <Text className="text-xs mt-1 mb-3" style={{ color: '#5a5280' }}>
                Permanently delete your channel and all associated data. This cannot be undone.
              </Text>
              <Button variant="danger" label="Delete Channel" />
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  )

  if (isDesktop) {
    return (
      <ErrorBoundary>
        <View className="flex-1" style={{ backgroundColor: '#141125' }}>
          <PageHeader title="Settings" />
          <View className="flex-1 flex-row">
            <View style={{ width: 200, borderRightWidth: 1, borderRightColor: '#1e1a35', paddingTop: 8 }}>
              {SETTINGS_TABS.map((t) => (
                <Pressable
                  key={t.key}
                  onPress={() => setTab(t.key)}
                  className="flex-row items-center px-5 py-3"
                  style={{
                    backgroundColor: tab === t.key
                      ? (t.key === 'danger' ? 'rgba(239,68,68,0.08)' : 'rgba(124,58,237,0.12)')
                      : 'transparent',
                    borderLeftWidth: 2,
                    borderLeftColor: tab === t.key
                      ? (t.key === 'danger' ? '#ef4444' : '#7C3AED')
                      : 'transparent',
                  }}
                >
                  <Text
                    className="text-sm font-medium"
                    style={{
                      color: tab === t.key
                        ? (t.key === 'danger' ? '#ef4444' : '#a78bfa')
                        : '#5a5280',
                    }}
                  >
                    {t.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            {tabContent}
          </View>
        </View>
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      <View className="flex-1" style={{ backgroundColor: '#141125' }}>
        <PageHeader title="Settings" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ borderBottomWidth: 1, borderBottomColor: '#1e1a35' } as any}
          contentContainerStyle={{ paddingHorizontal: 20 }}
        >
          <View className="flex-row">
            {SETTINGS_TABS.map((t) => (
              <Pressable
                key={t.key}
                onPress={() => setTab(t.key)}
                className="py-3 mr-5"
                style={{
                  borderBottomWidth: 2,
                  borderBottomColor: tab === t.key
                    ? (t.key === 'danger' ? '#ef4444' : '#7C3AED')
                    : 'transparent',
                }}
              >
                <Text
                  className="text-sm font-medium"
                  style={{
                    color: tab === t.key
                      ? (t.key === 'danger' ? '#ef4444' : '#a78bfa')
                      : '#5a5280',
                  }}
                >
                  {t.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
        {tabContent}
      </View>
    </ErrorBoundary>
  )
}
