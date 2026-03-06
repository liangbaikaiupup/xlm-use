// composables/usePolling.js
import { ref } from 'vue'

// 定义 fetchFn 的类型
type FetchFunction = (signal: AbortSignal) => Promise<any>

export function usePolling(fetchFn: FetchFunction, interval = 5000) {
  const data = ref<any>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)
  let abortController: AbortController | null = null
  let isVisible = true
  let timerId: number | null = null

  const poll = async () => {
    if (loading.value) return // 防止重复执行

    loading.value = true
    error.value = null

    try {
      abortController?.abort()
      abortController = new AbortController()

      const result = await fetchFn(abortController.signal)
      data.value = result
    } catch (err: any) {
      if (err instanceof Error) {
        if (err.name !== 'AbortError') {
          error.value = err
          console.warn('Polling error:', err)
        }
      } else {
         // Handle non-Error objects
         console.warn('Polling error:', err)
      }
    } finally {
      loading.value = false
      // 🔍 根据可见性决定是否继续
      if (isVisible) {
        if (timerId) clearTimeout(timerId)
        timerId = window.setTimeout(poll, interval)
      }
    }
  }

  const handleVisibility = () => {
    isVisible = !document.hidden
    if (isVisible) {
      if (!loading.value) {
        if (timerId) clearTimeout(timerId)
        timerId = window.setTimeout(poll, 1000)
      }
    } else {
      if (timerId) {
        clearTimeout(timerId)
        timerId = null
      }
    }
  }

  const start = () => {
    // 移除旧监听避免重复
    document.removeEventListener('visibilitychange', handleVisibility)
    document.addEventListener('visibilitychange', handleVisibility)
    
    isVisible = !document.hidden
    
    if (timerId) clearTimeout(timerId)
    poll()
  }

  const stop = () => {
    abortController?.abort()
    document.removeEventListener('visibilitychange', handleVisibility)
    if (timerId) {
      clearTimeout(timerId)
      timerId = null
    }
  }

  return { data, loading, error, start, stop }
}
