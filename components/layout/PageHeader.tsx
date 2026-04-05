import { View, Text, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native'
import { cn } from '@/lib/utils/cn'

export interface PageHeaderProps {
  title: string
  subtitle?: string
  backHref?: string
  showBack?: boolean
  action?: React.ReactNode
  /** Alias for action */
  rightContent?: React.ReactNode
  className?: string
}

export function PageHeader({ title, subtitle, backHref, showBack, action, rightContent, className }: PageHeaderProps) {
  const router = useRouter()
  const right = action ?? rightContent

  return (
    <View
      className={cn('flex-row items-center justify-between px-5 py-4', className)}
      style={{ borderBottomWidth: 1, borderBottomColor: '#1e1a35' }}
    >
      <View className="flex-row items-center gap-3 flex-1">
        {(backHref || showBack) && (
          <Pressable
            onPress={() => backHref ? router.push(backHref as any) : router.back()}
            className="p-1.5 rounded-lg -ml-1"
            style={{ backgroundColor: '#231D42' }}
          >
            <ChevronLeft size={18} color="#8889a0" />
          </Pressable>
        )}
        <View className="flex-1">
          <Text className="text-lg font-bold text-white">{title}</Text>
          {subtitle && (
            <Text className="text-xs mt-0.5" style={{ color: '#5a5280' }}>{subtitle}</Text>
          )}
        </View>
      </View>
      {right && <View>{right}</View>}
    </View>
  )
}
