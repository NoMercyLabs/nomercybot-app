export interface PipelineNode {
  id: string
  type: string
  label: string
  config: Record<string, any>
  position?: { x: number; y: number }
}

export interface PipelineConnection {
  id: string
  sourceId: string
  targetId: string
}

export interface PipelineGraph {
  nodes: PipelineNode[]
  connections: PipelineConnection[]
}

export interface NodeDefinition {
  type: string
  label: string
  category: 'trigger' | 'condition' | 'action'
  description: string
  defaultConfig: Record<string, any>
  configSchema: Record<string, { type: string; label: string; required?: boolean }>
}
