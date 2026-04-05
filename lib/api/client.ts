import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { Platform } from 'react-native'
import type { ApiError } from './types'

// Module-level token avoids circular dependency with auth store.
// Auth store calls setAuthToken() after login/refresh/restore.
let _token: string | null = null

export function setAuthToken(token: string | null): void {
  _token = token
}

const baseURL =
  Platform.OS === 'web'
    ? ''
    : process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:7000'

export const apiClient = axios.create({
  baseURL,
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Request interceptor — inject auth token + dev logging
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (_token && !config.headers['Authorization']) {
      config.headers['Authorization'] = `Bearer ${_token}`
    }
    if (__DEV__) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`)
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Response interceptor — normalize errors
// 401 handling is managed by the auth store's token refresh logic.
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    const message =
      error.response?.data?.message ??
      error.message ??
      'An unexpected error occurred'

    const apiError: ApiError = {
      message,
      code: error.response?.data?.code,
      status: error.response?.status,
      details: error.response?.data?.details,
    }

    return Promise.reject(apiError)
  },
)
