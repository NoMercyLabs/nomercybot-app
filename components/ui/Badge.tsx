import { View, Text } from 'react-native'
import { cn } from '@/lib/utils/cn'

export type BadgeVariant = 'default' | 'info' | 'success' | 'warning' | 'danger' | 'secondary' | 'muted'

export interface BadgeProps {
  label?: string
  children?: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

const variantStyles: Record<BadgeVariant, { container: string; text: string }> = {
  default: { container: 'bg-[#1e1043]', text: 'text-[#a78bfa]' },
  info: { container: 'bg-[#1e1043]', text: 'text-[#a78bfa]' },
  success: { container: 'bg-green-900', text: 'text-green-300' },
  warning: { container: 'bg-amber-900', text: 'text-amber-300' },
  danger: { container: 'bg-red-900', text: 'text-red-300' },
  secondary: { container: 'bg-[#231D42]', text: 'text-[#9ca3af]' },
  muted: { container: 'bg-[#231D42]', text: 'text-[#6b7280]' },
}

export function Badge({ label, children, variant = 'default', className }: BadgeProps) {
  const styles = variantStyles[variant]
  const content = label ?? children
  return (
    <View className={cn('rounded-md px-2 py-0.5', styles.container, className)}>
      <Text className={cn('text-xs font-medium', styles.text)}>{content}</Text>
    </View>
  )
}
