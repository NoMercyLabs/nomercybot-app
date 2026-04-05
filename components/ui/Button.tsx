import { Pressable, Text, ActivityIndicator, type PressableProps } from 'react-native'
import { cn } from '@/lib/utils/cn'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends PressableProps {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  label: string
  className?: string
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-accent-600 active:bg-accent-700',
  secondary: 'bg-surface-overlay border border-border active:bg-surface-raised',
  danger: 'bg-red-700 active:bg-red-800',
  ghost: 'active:bg-surface-overlay',
}

const textStyles: Record<ButtonVariant, string> = {
  primary: 'text-white',
  secondary: 'text-gray-200',
  danger: 'text-white',
  ghost: 'text-gray-300',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-2',
  md: 'px-4 py-3',
  lg: 'px-6 py-4',
}

const textSizeStyles: Record<ButtonSize, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  label,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <Pressable
      className={cn(
        'flex-row items-center justify-center rounded-xl gap-2',
        variantStyles[variant],
        sizeStyles[size],
        (disabled || loading) && 'opacity-50',
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <ActivityIndicator size="small" color="white" />}
      <Text className={cn('font-semibold', textStyles[variant], textSizeStyles[size])}>
        {label}
      </Text>
    </Pressable>
  )
}
