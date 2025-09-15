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

  const poll = async () => {
    if (loading.value) return // 防止重复执行

    loading.value = true
    error.value = null

    try {
      abortController?.abort()
      abortController = new AbortController()

      const result = await fetchFn(abortController.signal)
      data.value = result
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        error.value = err
        console.warn('Polling error:', err)
      }
    } finally {
      loading.value = false
      // 🔍 根据可见性决定是否继续
      if (isVisible) {
        setTimeout(poll, interval)
      }
    }
  }

  const start = () => {
    // 移除旧监听避免重复
    document.removeEventListener('visibilitychange', handleVisibility)
    document.addEventListener('visibilitychange', handleVisibility)
    poll()
  }

  const stop = () => {
    abortController?.abort()
    document.removeEventListener('visibilitychange', handleVisibility)
  }

  const handleVisibility = () => {
    isVisible = !document.hidden
    if (isVisible) {
      setTimeout(poll, 1000)
    }
  }

  return { data, loading, error, start, stop }
}

// 使用示例
// <script setup>
// import { usePolling } from '@/composables/usePolling'

// const fetchStatus = async (signal) => {
//   const res = await fetch('/api/servers/status', { signal })
//   return res.json()
// }

// const { data, loading } = usePolling(fetchStatus, 5000)

// // 自动在 onMounted 启动
// </script>

// <template>
//   <div v-if="loading">加载中...</div>
//   <ul v-else>
//     <li v-for="server in data" :key="server.id">
//       {{ server.name }} - {{ server.status }}
//     </li>
//   </ul>
// </template>
