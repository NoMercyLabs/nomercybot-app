import axios from 'axios'
import { API_BASE } from '@/lib/utils/constants'

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

// Response interceptor for error normalization
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ??
      error.message ??
      'An unexpected error occurred'
    const status = error.response?.status ?? 0
    const apiError = new Error(message) as Error & { status: number }
    apiError.status = status
    return Promise.reject(apiError)
  },
)
