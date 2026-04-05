import { View, Text, ScrollView, RefreshControl } from 'react-native'
import { useQuery, useMutation } from '@tanstack/react-query'
import * as WebBrowser from 'expo-web-browser'
import { apiClient } from '@/lib/api/client'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { Check, X, CreditCard, ArrowUpRight } from 'lucide-react-native'
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary'

interface BillingInfo {
  plan: 'free' | 'pro' | 'enterprise'
  status: 'active' | 'trialing' | 'past_due' | 'canceled'
  billingCycleEnd: string | null
  portalUrl: string | null
  features: string[]
}

interface PortalResponse {
  url: string
}

const PLAN_META: Record<string, { label: string; color: string; badge: 'default' | 'success' | 'warning' | 'info' }> = {
  free: { label: 'Free', color: 'text-gray-300', badge: 'default' },
  pro: { label: 'Pro', color: 'text-accent-300', badge: 'info' },
  enterprise: { label: 'Enterprise', color: 'text-yellow-300', badge: 'warning' },
}

const PLAN_FEATURES: Record<string, { label: string; free: boolean; pro: boolean; enterprise: boolean }[]> = {
  features: [
    { label: 'Unlimited commands', free: false, pro: true, enterprise: true },
    { label: 'Custom bot name', free: false, pro: true, enterprise: true },
    { label: 'Channel point rewards', free: true, pro: true, enterprise: true },
    { label: 'Timers & scheduled messages', free: true, pro: true, enterprise: true },
    { label: 'Chat moderation tools', free: true, pro: true, enterprise: true },
    { label: 'Pipeline automations', free: false, pro: true, enterprise: true },
    { label: 'Spotify integration', free: false, pro: true, enterprise: true },
    { label: 'Multi-channel management', free: false, pro: false, enterprise: true },
    { label: 'Priority support', free: false, pro: false, enterprise: true },
    { label: 'Custom integrations', free: false, pro: false, enterprise: true },
  ],
}

function FeatureRow({ label, included }: { label: string; included: boolean }) {
  return (
    <View className="flex-row items-center gap-3 py-2 border-b border-border last:border-b-0">
      {included
        ? <Check size={14} color="rgb(74,222,128)" />
        : <X size={14} color="rgb(107,114,128)" />
      }
      <Text className={included ? 'text-sm text-gray-200' : 'text-sm text-gray-500'}>
        {label}
      </Text>
    </View>
  )
}

export function BillingScreen() {
  const { data, isLoading, isRefetching, refetch } = useQuery<BillingInfo>({
    queryKey: ['me', 'billing'],
    queryFn: async () => {
      const res = await apiClient.get<{ data: BillingInfo }>('/v1/me/billing')
      return res.data.data
    },
  })

  const portalMutation = useMutation<PortalResponse, Error>({
    mutationFn: async () => {
      const res = await apiClient.post<{ data: PortalResponse }>('/v1/me/billing/portal')
      return res.data.data
    },
    onSuccess: async (result) => {
      await WebBrowser.openBrowserAsync(result.url)
    },
  })

  function handleManageBilling() {
    if (data?.portalUrl) {
      WebBrowser.openBrowserAsync(data.portalUrl)
    } else {
      portalMutation.mutate()
    }
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const plan = data?.plan ?? 'free'
  const planMeta = PLAN_META[plan] ?? PLAN_META.free
  const featureList = PLAN_FEATURES.features

  return (
    <ErrorBoundary>
    <ScrollView className="flex-1 bg-gray-950" contentContainerClassName="pb-8" refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}>
      <PageHeader title="Billing" subtitle="Manage your subscription" />

      <View className="px-4 pt-4 gap-4">
        {isLoading ? (
          <Skeleton className="h-28 w-full" count={3} />
        ) : (
          <>
            {/* Current Plan */}
            <Card>
              <CardHeader title="Current Plan" />
              <View className="px-4 py-4 gap-4">
                <View className="flex-row items-center justify-between">
                  <View className="gap-1">
                    <Text className={`text-2xl font-bold ${planMeta.color}`}>
                      {planMeta.label}
                    </Text>
                    {data?.status && (
                      <View className="flex-row items-center gap-2">
                        <Badge
                          variant={
                            data.status === 'active' || data.status === 'trialing'
                              ? 'success'
                              : data.status === 'past_due'
                              ? 'warning'
                              : 'muted'
                          }
                          label={
                            data.status === 'trialing'
                              ? 'Trial'
                              : data.status === 'past_due'
                              ? 'Past Due'
                              : data.status === 'canceled'
                              ? 'Canceled'
                              : 'Active'
                          }
                        />
                      </View>
                    )}
                  </View>
                  <CreditCard size={32} color="rgb(139,92,246)" />
                </View>

                {data?.billingCycleEnd && (
                  <View className="bg-surface-overlay rounded-lg px-3 py-2">
                    <Text className="text-xs text-gray-500">
                      {data.status === 'trialing' ? 'Trial ends' : 'Next billing date'}:{' '}
                      <Text className="text-gray-300">{formatDate(data.billingCycleEnd)}</Text>
                    </Text>
                  </View>
                )}

                {plan !== 'free' && (
                  <Button
                    label="Manage Billing"
                    variant="secondary"
                    leftIcon={<ArrowUpRight size={16} color="rgb(209,213,219)" />}
                    loading={portalMutation.isPending}
                    onPress={handleManageBilling}
                  />
                )}
              </View>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader title={`${planMeta.label} Features`} />
              <View className="px-4 py-2">
                {featureList.map((feature) => (
                  <FeatureRow
                    key={feature.label}
                    label={feature.label}
                    included={feature[plan as keyof typeof feature] as boolean}
                  />
                ))}
              </View>
            </Card>

            {/* Upgrade CTA */}
            {plan === 'free' && (
              <Card className="border border-accent-800 bg-accent-950">
                <View className="px-4 py-4 gap-3">
                  <Text className="text-base font-semibold text-accent-200">Upgrade to Pro</Text>
                  <Text className="text-sm text-accent-400">
                    Unlock unlimited commands, pipeline automations, custom integrations, and more.
                  </Text>
                  <Button
                    label="Upgrade Now"
                    leftIcon={<ArrowUpRight size={16} color="white" />}
                    onPress={handleManageBilling}
                    loading={portalMutation.isPending}
                  />
                </View>
              </Card>
            )}
          </>
        )}
      </View>
    </ScrollView>
    </ErrorBoundary>
  )
}
