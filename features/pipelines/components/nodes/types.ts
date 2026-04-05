import type { NodeType } from '@/types/pipeline'

export interface NodeDefinition {
  nodeType: string
  type: NodeType
  label: string
  description: string
  configSchema?: Record<string, unknown>
}
