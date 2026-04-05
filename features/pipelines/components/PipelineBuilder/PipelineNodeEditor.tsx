import { View, Text, ScrollView, Pressable } from 'react-native'
import { X } from 'lucide-react-native'
import { Input } from '@/components/ui/Input'
import type { PipelineNode } from '@/types/pipeline'

interface PipelineNodeEditorProps {
  node: PipelineNode
  onUpdate: (updates: Partial<PipelineNode>) => void
  onClose: () => void
}

export function PipelineNodeEditor({ node, onUpdate, onClose }: PipelineNodeEditorProps) {
  return (
    <View className="flex-1 bg-surface-raised">
      <View className="flex-row items-center justify-between border-b border-border px-4 py-3">
        <Text className="text-gray-100 font-semibold">{node.label}</Text>
        <Pressable onPress={onClose} className="p-1">
          <X size={18} color="rgb(156,163,175)" />
        </Pressable>
      </View>
      <ScrollView className="flex-1 p-4 gap-4">
        <Input
          label="Label"
          value={node.label}
          onChangeText={(v) => onUpdate({ label: v })}
        />
        <View className="gap-2">
          <Text className="text-sm font-medium text-gray-300">Type</Text>
          <Text className="text-gray-400 text-sm capitalize">{node.type} / {node.nodeType}</Text>
        </View>
        <View className="gap-2">
          <Text className="text-sm font-medium text-gray-300">Configuration</Text>
          <Text className="text-gray-500 text-xs font-mono">
            {JSON.stringify(node.config, null, 2)}
          </Text>
        </View>
      </ScrollView>
    </View>
  )
}
