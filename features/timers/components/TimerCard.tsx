import { View, Text, Pressable } from 'react-native'
import { Clock, ChevronRight } from 'lucide-react-native'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Toggle } from '@/components/ui/Toggle'
import type { Timer } from '../types'

interface TimerCardProps {
  timer: Timer
  onPress: () => void
  onToggle: (enabled: boolean) => void
}

export function TimerCard({ timer, onPress, onToggle }: TimerCardProps) {
  return (
    <Pressable onPress={onPress}>
      <Card className="gap-3">
        <View className="flex-row items-start justify-between gap-2">
          <View className="flex-1 gap-1">
            <View className="flex-row items-center gap-2">
              <Clock size={14} color="#8889a0" />
              <Text className="text-sm font-semibold text-gray-100">{timer.name}</Text>
            </View>
            <Text className="text-xs text-gray-500 leading-relaxed" numberOfLines={2}>
              {timer.messages[0] ?? '(no messages)'}
              {timer.messages.length > 1 && (
                <Text className="text-gray-600"> +{timer.messages.length - 1} more</Text>
              )}
            </Text>
          </View>
          <Toggle value={timer.isEnabled} onValueChange={onToggle} />
        </View>

        <View className="flex-row items-center gap-2">
          <Badge
            variant={timer.isEnabled ? 'success' : 'muted'}
            label={timer.isEnabled ? 'Active' : 'Inactive'}
          />
          <Badge variant="secondary" label={`Every ${timer.intervalMinutes}m`} />
          {timer.minChatLines > 0 && (
            <Badge variant="secondary" label={`${timer.minChatLines}+ lines`} />
          )}
          <View className="flex-1" />
          <ChevronRight size={14} color="#5a5b72" />
        </View>
      </Card>
    </Pressable>
  )
}
