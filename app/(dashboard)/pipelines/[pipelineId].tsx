import { View } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { PageHeader } from '@/components/layout/PageHeader'
import { useApiQuery } from '@/hooks/useApi'
import { PipelineBuilder } from '@/features/pipelines/components/PipelineBuilder/PipelineBuilder'
import type { Pipeline } from '@/types/pipeline'

export default function PipelineEditorScreen() {
  const { pipelineId } = useLocalSearchParams<{ pipelineId: string }>()
  const isNew = pipelineId === 'new'

  const { data: pipeline } = useApiQuery<Pipeline>(
    `pipelines/${pipelineId}`,
    `/pipelines/${pipelineId}`,
    { enabled: !isNew },
  )

  return (
    <View className="flex-1 bg-surface">
      <PageHeader
        title={isNew ? 'New Pipeline' : (pipeline?.name ?? 'Pipeline')}
        backHref="/(dashboard)/pipelines"
      />
      <View className="flex-1">
        <PipelineBuilder pipeline={isNew ? undefined : pipeline} />
      </View>
    </View>
  )
}
