import { View, Text, ScrollView, Pressable } from 'react-native'
import { X, Trash2 } from 'lucide-react-native'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Toggle } from '@/components/ui/Toggle'
import { Button } from '@/components/ui/Button'
import { NODE_REGISTRY } from '../nodes/registry'
import type { PipelineNode } from '@/types/pipeline'

interface PipelineNodeEditorProps {
  node: PipelineNode
  onUpdate: (updates: Partial<PipelineNode>) => void
  onDelete?: () => void
  onClose: () => void
}

export function PipelineNodeEditor({ node, onUpdate, onDelete, onClose }: PipelineNodeEditorProps) {
  const def = NODE_REGISTRY.find((n) => n.nodeType === node.nodeType)

  function updateConfig(key: string, value: unknown) {
    onUpdate({ config: { ...node.config, [key]: value } })
  }

  const CATEGORY_TEXT: Record<string, string> = {
    trigger: 'text-green-300',
    condition: 'text-amber-300',
    action: 'text-blue-300',
  }
  const CATEGORY_BG: Record<string, string> = {
    trigger: 'bg-green-900',
    condition: 'bg-amber-900',
    action: 'bg-blue-900',
  }

  return (
    <View className="flex-1 bg-surface-raised">
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-border px-4 py-3">
        <View className="flex-1 gap-0.5">
          <View className={`self-start rounded px-1.5 py-0.5 ${CATEGORY_BG[node.type] ?? 'bg-gray-800'}`}>
            <Text className={`text-xs font-medium capitalize ${CATEGORY_TEXT[node.type] ?? 'text-gray-300'}`}>
              {node.type}
            </Text>
          </View>
          <Text className="text-gray-100 font-semibold">{node.label}</Text>
          {def?.description && (
            <Text className="text-xs text-gray-500">{def.description}</Text>
          )}
        </View>
        <Pressable onPress={onClose} className="p-1 ml-2">
          <X size={18} color="rgb(156,163,175)" />
        </Pressable>
      </View>

      <ScrollView className="flex-1 p-4" contentContainerStyle={{ gap: 16 }}>
        {/* Label */}
        <Input
          label="Label"
          value={node.label}
          onChangeText={(v) => onUpdate({ label: v })}
        />

        {/* Config schema fields */}
        {def?.configSchema && Object.entries(def.configSchema).map(([key, field]: [string, any]) => {
          const value = node.config[key]

          if (field.type === 'select') {
            const options = (field.options as string[]).map((o) => ({ label: o, value: o }))
            return (
              <Select
                key={key}
                label={field.label}
                value={String(value ?? field.defaultValue ?? options[0]?.value ?? '')}
                onValueChange={(v) => updateConfig(key, v)}
                options={options}
              />
            )
          }

          if (field.type === 'number') {
            return (
              <Input
                key={key}
                label={field.label}
                placeholder={field.placeholder ?? String(field.defaultValue ?? 0)}
                value={String(value ?? field.defaultValue ?? '')}
                onChangeText={(v) => updateConfig(key, parseInt(v, 10) || 0)}
                keyboardType="numeric"
              />
            )
          }

          if (field.type === 'toggle') {
            return (
              <Toggle
                key={key}
                label={field.label}
                value={!!value}
                onValueChange={(v) => updateConfig(key, v)}
              />
            )
          }

          // text / variable / default
          return (
            <Input
              key={key}
              label={field.label}
              placeholder={field.placeholder ?? ''}
              value={String(value ?? '')}
              onChangeText={(v) => updateConfig(key, v)}
            />
          )
        })}

        {/* No config */}
        {def && !def.configSchema && (
          <Text className="text-sm text-gray-500">No configuration needed for this node.</Text>
        )}

        {/* Delete */}
        {onDelete && (
          <Button
            variant="danger"
            onPress={onDelete}
            leftIcon={<Trash2 size={14} color="white" />}
            label="Delete Node"
          />
        )}
      </ScrollView>
    </View>
  )
}
