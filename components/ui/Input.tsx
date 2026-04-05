import { TextInput, View, Text, type TextInputProps } from 'react-native'
import { cn } from '@/lib/utils/cn'

interface InputProps extends TextInputProps {
  label?: string
  error?: string
  className?: string
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <View className="gap-1.5">
      {label && <Text className="text-sm font-medium text-gray-300">{label}</Text>}
      <TextInput
        className={cn(
          'rounded-lg bg-surface-raised border border-border px-4 py-3 text-gray-100',
          'focus:border-accent-500',
          error && 'border-red-500',
          className,
        )}
        placeholderTextColor="rgb(107, 114, 128)"
        {...props}
      />
      {error && <Text className="text-xs text-red-400">{error}</Text>}
    </View>
  )
}
