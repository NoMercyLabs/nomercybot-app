import { Switch, View, Text } from 'react-native'

interface ToggleProps {
  value: boolean
  onValueChange: (value: boolean) => void
  label?: string
  description?: string
  disabled?: boolean
}

export function Toggle({ value, onValueChange, label, description, disabled }: ToggleProps) {
  return (
    <View className="flex-row items-center justify-between gap-4">
      {(label || description) && (
        <View className="flex-1 gap-0.5">
          {label && <Text className="text-gray-200 font-medium">{label}</Text>}
          {description && <Text className="text-sm text-gray-500">{description}</Text>}
        </View>
      )}
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: 'rgb(55, 65, 81)', true: 'rgb(109, 40, 217)' }}
        thumbColor={value ? 'rgb(167, 139, 250)' : 'rgb(156, 163, 175)'}
      />
    </View>
  )
}
