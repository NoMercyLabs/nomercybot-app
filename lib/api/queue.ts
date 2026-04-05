import { apiClient } from './client'
import type { ApiResponse } from './types'

interface QueuedRequest {
  resolve: (value: unknown) => void
  reject: (error: unknown) => void
  fn: () => Promise<unknown>
}

const queue: QueuedRequest[] = []
let isProcessing = false

export async function enqueue<T>(fn: () => Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    queue.push({ resolve: resolve as (v: unknown) => void, reject, fn })
    if (!isProcessing) processQueue()
  })
}

async function processQueue() {
  isProcessing = true
  while (queue.length > 0) {
    const item = queue.shift()!
    try {
      const result = await item.fn()
      item.resolve(result)
    } catch (err) {
      item.reject(err)
    }
  }
  isProcessing = false
}
