import { View, Text, Pressable, ScrollView } from 'react-native'
import { useState } from 'react'
import { usePipelineState } from './usePipelineState'
import { PipelineStepList } from './PipelineStepList'
import { PipelineToolbar } from './PipelineToolbar'
import { PipelineNodeEditor } from './PipelineNodeEditor'
import type { PipelineBuilderProps } from './types'

export function PipelineBuilderWeb({ pipeline, onSave }: PipelineBuilderProps) {
  const {
    nodes,
    selectedNodeId,
    isDirty,
    addNode,
    updateNode,
    removeNode,
    selectNode,
    reorderNodes,
  } = usePipelineState(pipeline?.graph.nodes ?? [])

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) ?? null

  return (
    <View className="flex-1 flex-row">
      {/* Left: Node list / canvas */}
      <View className="flex-1">
        <PipelineToolbar
          isDirty={isDirty}
          onAddNode={addNode}
          onSave={() => {
            if (pipeline) {
              onSave?.({ ...pipeline, graph: { ...pipeline.graph, nodes } })
            }
          }}
        />
        <PipelineStepList
          nodes={nodes}
          selectedNodeId={selectedNodeId}
          onSelect={selectNode}
          onRemove={removeNode}
          onReorder={reorderNodes}
        />
      </View>

      {/* Right: Node editor panel */}
      {selectedNode && (
        <View className="w-80 border-l border-border">
          <PipelineNodeEditor
            node={selectedNode}
            onUpdate={(updates) => updateNode(selectedNode.id, updates)}
            onClose={() => selectNode(null)}
          />
        </View>
      )}
    </View>
  )
}
