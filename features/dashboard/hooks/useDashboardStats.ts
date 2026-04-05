import { useApiQuery } from '@/hooks/useApi'
import type { DashboardStats } from '../types'

export function useDashboardStats() {
  return useApiQuery<DashboardStats>('stats', '/stats')
}
