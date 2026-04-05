import { View, Text, ScrollView, Pressable } from 'react-native'
import { useState } from 'react'
import { Plus, Trash2, ArrowDown, Settings2 } from 'lucide-react-native'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { getNodeDef, NODES_BY_CATEGORY, NODE_REGISTRY } from './nodeRegistry'
import type { PipelineGraph, PipelineNode } from './types'
import { nanoid } from 'nanoid/non-secure'

interface PipelineBuilderProps {
  graph: PipelineGraph
  onSave: (graph: PipelineGraph) => void
  readOnly?: boolean
  isLoading?: boolean
}

const CATEGORY_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  trigger: { bg: 'bg-blue-500/10', border: 'border-blue-500/40', text: 'text-blue-400' },
  condition: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/40', text: 'text-yellow-400' },
  action: { bg: 'bg-green-500/10', border: 'border-green-500/40', text: 'text-green-400' },
}

const NODE_REGISTRY_MAP: Record<string, any> = Object.fromEntries(
  NODE_REGISTRY.map((n) => [n.type, n])
)

function CanvasNode({
  node,
  onRemove,
  onEdit,
  readOnly,
}: {
  node: PipelineNode
  onRemove: () => void
  onEdit: () => void
  readOnly?: boolean
}) {
  const def = getNodeDef(node.type)
  const styles = CATEGORY_STYLES[def?.category ?? 'action']

  return (
    <View className={`rounded-xl border ${styles.bg} ${styles.border} p-4 w-72 gap-2`}>
      <View className="flex-row items-start justify-between">
        <View className="flex-1 gap-0.5">
          <Text className={`text-xs font-semibold uppercase ${styles.text}`}>{def?.category}</Text>
          <Text className="text-sm font-semibold text-white">{node.label}</Text>
        </View>
        {!readOnly && (
          <View className="flex-row gap-1">
            <Pressable onPress={onEdit} className="rounded p-1 active:bg-white/10">
              <Settings2 size={14} color="#6b7280" />
            </Pressable>
            <Pressable onPress={onRemove} className="rounded p-1 active:bg-red-500/20">
              <Trash2 size={14} color="#f87171" />
            </Pressable>
          </View>
        )}
      </View>
      {def?.description && (
        <Text className="text-xs text-gray-500">{def.description}</Text>
      )}
      {!readOnly && (
        <View className="mt-1">
          <Text className="text-xs text-gray-600">
            {Object.keys(node.config).length > 0
              ? `${Object.keys(node.config).length} config field(s) set`
              : 'No config'}
          </Text>
        </View>
      )}
    </View>
  )
}

function NodePalette({ onAdd }: { onAdd: (type: string, label: string) => void }) {
  const [activeCategory, setActiveCategory] = useState<'trigger' | 'condition' | 'action'>('trigger')

  return (
    <View className="w-64 border-l border-gray-800 bg-gray-900">
      <View className="border-b border-gray-800 p-3">
        <Text className="text-sm font-semibold text-white">Node Palette</Text>
      </View>
      <View className="flex-row border-b border-gray-800">
        {(['trigger', 'condition', 'action'] as const).map((cat) => (
          <Pressable
            key={cat}
            onPress={() => setActiveCategory(cat)}
            className={`flex-1 py-2 items-center ${activeCategory === cat ? 'border-b-2 border-accent-500' : ''}`}
          >
            <Text className={`text-xs capitalize ${activeCategory === cat ? 'text-accent-400' : 'text-gray-500'}`}>{cat}</Text>
          </Pressable>
        ))}
      </View>
      <ScrollView>
        {NODES_BY_CATEGORY[activeCategory].map((node) => (
          <Pressable
            key={node.type}
            onPress={() => onAdd(node.type, node.label)}
            className="border-b border-gray-800/50 px-4 py-3 gap-1 active:bg-gray-800"
          >
            <Text className="text-sm text-white">{node.label}</Text>
            <Text className="text-xs text-gray-600">{node.description}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  )
}

export function PipelineBuilder({ graph, onSave, readOnly, isLoading }: PipelineBuilderProps) {
  const [nodes, setNodes] = useState<PipelineNode[]>(graph.nodes)
  const [editingNode, setEditingNode] = useState<PipelineNode | null>(null)

  if (isLoading) {
    return (
      <View className="flex-1 gap-3 p-4">
        <Skeleton className="h-32 w-72" count={3} />
      </View>
    )
  }

  function addNode(type: string, label: string) {
    const def = NODE_REGISTRY_MAP[type]
    setNodes((prev) => [...prev, {
      id: nanoid(),
      type,
      label,
      config: def?.defaultConfig ?? {},
      position: { x: 100, y: prev.length * 120 + 50 },
    }])
  }

  function removeNode(id: string) {
    setNodes((prev) => prev.filter((n) => n.id !== id))
  }

  function updateNodeConfig(id: string, config: Record<string, any>) {
    setNodes((prev) => prev.map((n) => n.id === id ? { ...n, config } : n))
  }

  return (
    <View className="flex-1 flex-row">
      {/* Canvas */}
      <ScrollView className="flex-1" contentContainerClassName="p-6 gap-2 items-start">
        {!readOnly && (
          <Text className="text-xs text-gray-600 mb-4">Pipeline flows top to bottom. Steps execute in order.</Text>
        )}

        {nodes.length === 0 ? (
          <View className="items-center gap-3 py-16 px-8">
            <Text className="text-gray-600 text-center">No steps yet.</Text>
            {!readOnly && <Text className="text-xs text-gray-700 text-center">Add nodes from the palette →</Text>}
          </View>
        ) : (
          nodes.map((node, i) => (
            <View key={node.id} className="items-center gap-2">
              <CanvasNode
                node={node}
                onRemove={() => removeNode(node.id)}
                onEdit={() => setEditingNode(node)}
                readOnly={readOnly}
              />
              {i < nodes.length - 1 && (
                <ArrowDown size={16} color="#374151" />
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* Palette (hidden in readOnly) */}
      {!readOnly && <NodePalette onAdd={addNode} />}

      {/* Save bar */}
      {!readOnly && (
        <View className="absolute bottom-4 left-4">
          <Button onPress={() => onSave({ nodes, connections: graph.connections })}>
            Save Pipeline
          </Button>
        </View>
      )}

      {/* Config modal */}
      {editingNode && (
        <Modal
          visible
          onClose={() => setEditingNode(null)}
          title={`Configure: ${editingNode.label}`}
          size="md"
        >
          <View className="p-4 gap-4">
            {(() => {
              const def = getNodeDef(editingNode.type)
              if (!def || Object.keys(def.configSchema).length === 0) {
                return <Text className="text-sm text-gray-500">No configuration needed.</Text>
              }
              return Object.entries(def.configSchema).map(([key, schema]) => (
                <Input
                  key={key}
                  label={schema.label}
                  value={String(editingNode.config[key] ?? '')}
                  onChangeText={(v) => updateNodeConfig(editingNode.id, { ...editingNode.config, [key]: v })}
                />
              ))
            })()}
            <Button onPress={() => setEditingNode(null)}>Done</Button>
          </View>
        </Modal>
      )}
    </View>
  )
}
