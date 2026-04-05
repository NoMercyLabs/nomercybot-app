import { View, Text, FlatList, Pressable, ScrollView } from 'react-native'
import { useState } from 'react'
import { GripVertical, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react-native'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { getNodeDef, NODES_BY_CATEGORY } from './nodeRegistry'
import type { PipelineGraph, PipelineNode } from './types'
import { nanoid } from 'nanoid/non-secure'

interface PipelineBuilderProps {
  graph: PipelineGraph
  onSave: (graph: PipelineGraph) => void
  readOnly?: boolean
  isLoading?: boolean
}

function NodeCard({ node, onRemove, readOnly }: { node: PipelineNode; onRemove: () => void; readOnly?: boolean }) {
  const def = getNodeDef(node.type)
  const categoryColor = def?.category === 'trigger' ? 'text-blue-400' : def?.category === 'condition' ? 'text-yellow-400' : 'text-green-400'
  const categoryBg = def?.category === 'trigger' ? 'bg-blue-500/10 border-blue-500/30' : def?.category === 'condition' ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-green-500/10 border-green-500/30'

  return (
    <View className={`flex-row items-center gap-3 rounded-xl border p-4 ${categoryBg}`}>
      {!readOnly && <GripVertical size={16} color="#4b5563" />}
      <View className="flex-1 gap-1">
        <Text className={`text-xs font-semibold uppercase ${categoryColor}`}>{def?.category ?? 'unknown'}</Text>
        <Text className="text-sm font-medium text-white">{node.label}</Text>
        {def?.description && (
          <Text className="text-xs text-gray-500">{def.description}</Text>
        )}
      </View>
      {!readOnly && (
        <Pressable onPress={onRemove} className="rounded-lg p-1.5 active:bg-red-500/20">
          <Trash2 size={14} color="#f87171" />
        </Pressable>
      )}
    </View>
  )
}

function AddNodePicker({ onAdd }: { onAdd: (type: string, label: string) => void }) {
  const [open, setOpen] = useState(false)
  const [category, setCategory] = useState<'trigger' | 'condition' | 'action'>('trigger')

  if (!open) {
    return (
      <Pressable
        onPress={() => setOpen(true)}
        className="flex-row items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-700 py-4 active:border-accent-500"
      >
        <Plus size={16} color="#6b7280" />
        <Text className="text-sm text-gray-500">Add Step</Text>
      </Pressable>
    )
  }

  return (
    <View className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
      <View className="flex-row border-b border-gray-800">
        {(['trigger', 'condition', 'action'] as const).map((cat) => (
          <Pressable
            key={cat}
            onPress={() => setCategory(cat)}
            className={`flex-1 py-2.5 items-center ${category === cat ? 'bg-accent-500/15' : ''}`}
          >
            <Text className={`text-xs font-medium capitalize ${category === cat ? 'text-accent-400' : 'text-gray-500'}`}>
              {cat}
            </Text>
          </Pressable>
        ))}
      </View>
      <ScrollView className="max-h-48">
        {NODES_BY_CATEGORY[category].map((node) => (
          <Pressable
            key={node.type}
            onPress={() => { onAdd(node.type, node.label); setOpen(false) }}
            className="border-b border-gray-800/50 px-4 py-3 active:bg-gray-800"
          >
            <Text className="text-sm text-white">{node.label}</Text>
            <Text className="text-xs text-gray-500">{node.description}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <Pressable onPress={() => setOpen(false)} className="items-center py-2.5 active:bg-gray-800">
        <Text className="text-xs text-gray-600">Cancel</Text>
      </Pressable>
    </View>
  )
}

export function PipelineBuilder({ graph, onSave, readOnly, isLoading }: PipelineBuilderProps) {
  const [nodes, setNodes] = useState<PipelineNode[]>(graph.nodes)

  if (isLoading) {
    return (
      <View className="flex-1 gap-3 p-4">
        <Skeleton className="h-16 w-full" count={3} />
      </View>
    )
  }

  if (readOnly) {
    return (
      <ScrollView className="flex-1" contentContainerClassName="p-4 gap-3">
        <Text className="text-xs text-center text-gray-500 mb-2">
          Pipeline editing is available on the web dashboard.
        </Text>
        {nodes.map((node) => (
          <NodeCard key={node.id} node={node} onRemove={() => {}} readOnly />
        ))}
      </ScrollView>
    )
  }

  function addNode(type: string, label: string) {
    const def = NODE_REGISTRY_MAP[type]
    setNodes((prev) => [...prev, {
      id: nanoid(),
      type,
      label,
      config: def?.defaultConfig ?? {},
    }])
  }

  function removeNode(id: string) {
    setNodes((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <View className="flex-1">
      <ScrollView className="flex-1" contentContainerClassName="p-4 gap-3">
        {nodes.map((node) => (
          <NodeCard key={node.id} node={node} onRemove={() => removeNode(node.id)} />
        ))}
        <AddNodePicker onAdd={addNode} />
      </ScrollView>
      <View className="border-t border-gray-800 p-4">
        <Button onPress={() => onSave({ nodes, connections: graph.connections })}>
          Save Pipeline
        </Button>
      </View>
    </View>
  )
}

// Mini registry map for config access
import { NODE_REGISTRY } from './nodeRegistry'
const NODE_REGISTRY_MAP: Record<string, any> = Object.fromEntries(
  NODE_REGISTRY.map((n) => [n.type, n])
)
