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
      {label && <Text className="text-sm font-medium" style={{ color: '#d1d5db' }}>{label}</Text>}
      <TextInput
        className={cn(
          'rounded-lg px-4 py-3',
          error ? 'border-red-500' : 'border-[#1e1a35]',
          'border',
          className,
        )}
        style={{ backgroundColor: '#1A1530', color: '#f4f5fa', outlineStyle: 'none' } as any}
        placeholderTextColor="#3d3566"
        {...props}
      />
      {error && <Text className="text-xs text-red-400">{error}</Text>}
    </View>
  )
}
