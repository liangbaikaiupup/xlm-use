# usePolling 轮询组合函数

用于实现数据轮询功能的组合函数，支持页面可见性检测和自动停止机制。

## 基础用法

```vue
<script setup>
import { usePolling } from 'xlm-use'
import { fetchData } from '@/api'

const { data, loading, error, start, stop } = usePolling(
  async (signal) => {
    const response = await fetchData({ signal })
    return response.data
  },
  5000 // 5秒轮询间隔
)

// 开始轮询
start()
</script>
```

## API

### 参数

```typescript
usePolling(fetchFn: FetchFunction, interval?: number)
```

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `fetchFn` | `FetchFunction` | - | 数据获取函数，接收 AbortSignal 参数 |
| `interval` | `number` | `5000` | 轮询间隔时间（毫秒） |

### 返回值

```typescript
interface PollingResult {
  data: Ref<any>           // 轮询获取的数据
  loading: Ref<boolean>    // 加载状态
  error: Ref<Error | null> // 错误信息
  start: () => void        // 开始轮询
  stop: () => void         // 停止轮询
}
```

## 详细示例

### 基础轮询

```vue
<template>
  <div class="polling-demo">
    <div class="status">
      <span v-if="loading" class="loading">🔄 加载中...</span>
      <span v-else-if="error" class="error">❌ {{ error.message }}</span>
      <span v-else class="success">✅ 数据已更新</span>
    </div>
    
    <div class="data" v-if="data">
      <h3>服务器状态</h3>
      <pre>{{ JSON.stringify(data, null, 2) }}</pre>
    </div>
    
    <div class="controls">
      <button @click="start" :disabled="isPolling">开始轮询</button>
      <button @click="stop" :disabled="!isPolling">停止轮询</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { usePolling } from 'xlm-use'
import { getServerStatus } from '@/api'

const isPolling = ref(false)

const { data, loading, error, start: startPolling, stop: stopPolling } = usePolling(
  async (signal) => {
    try {
      const response = await getServerStatus({ signal })
      return response.data
    } catch (err) {
      if (err.name !== 'AbortError') {
        throw err
      }
    }
  },
  3000 // 3秒轮询
)

const start = () => {
  isPolling.value = true
  startPolling()
}

const stop = () => {
  isPolling.value = false
  stopPolling()
}

// 组件挂载时自动开始轮询
onMounted(() => {
  start()
})

// 组件卸载时停止轮询
onUnmounted(() => {
  stop()
})
</script>

<style scoped>
.polling-demo {
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.status {
  margin-bottom: 16px;
  font-weight: bold;
}

.loading { color: #1890ff; }
.error { color: #ff4d4f; }
.success { color: #52c41a; }

.data {
  margin: 16px 0;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 4px;
}

.controls button {
  margin-right: 8px;
  padding: 8px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
}

.controls button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
```

### 条件轮询

```vue
<script setup>
import { ref, watch } from 'vue'
import { usePolling } from 'xlm-use'

const shouldPoll = ref(false)
const userId = ref(null)

const { data, loading, error, start, stop } = usePolling(
  async (signal) => {
    if (!userId.value) return null
    
    const response = await getUserStatus(userId.value, { signal })
    return response.data
  },
  2000
)

// 监听条件变化
watch([shouldPoll, userId], ([poll, id]) => {
  if (poll && id) {
    start()
  } else {
    stop()
  }
})
</script>
```

### 错误处理

```vue
<script setup>
import { usePolling } from 'xlm-use'

const { data, loading, error, start, stop } = usePolling(
  async (signal) => {
    try {
      const response = await fetchData({ signal })
      return response.data
    } catch (err) {
      // 忽略取消错误
      if (err.name === 'AbortError') {
        return
      }
      
      // 处理网络错误
      if (err.code === 'NETWORK_ERROR') {
        console.warn('网络错误，将在下次轮询时重试')
        return
      }
      
      // 抛出其他错误
      throw err
    }
  },
  5000
)

// 监听错误
watch(error, (err) => {
  if (err) {
    console.error('轮询错误:', err)
    // 可以选择停止轮询或显示错误提示
  }
})
</script>
```

## 特性说明

### 页面可见性检测

usePolling 会自动检测页面可见性：

- 当页面不可见时（切换标签页、最小化窗口），轮询会暂停
- 当页面重新可见时，轮询会自动恢复
- 这有助于节省资源和减少不必要的网络请求

### 自动清理

- 组件卸载时会自动停止轮询
- 每次新的轮询开始前会取消之前的请求
- 避免内存泄漏和竞态条件

### 错误处理

- 自动捕获和处理轮询过程中的错误
- 区分取消错误和实际错误
- 错误不会中断轮询循环

## 注意事项

1. **AbortSignal 支持**：传入的 fetchFn 应该支持 AbortSignal 来正确处理请求取消
2. **错误处理**：建议在 fetchFn 中妥善处理错误，避免轮询中断
3. **资源清理**：组件卸载时记得调用 stop() 方法
4. **性能考虑**：合理设置轮询间隔，避免过于频繁的请求

## TypeScript 类型

```typescript
type FetchFunction = (signal: AbortSignal) => Promise<any>

interface PollingResult {
  data: Ref<any>
  loading: Ref<boolean>
  error: Ref<Error | null>
  start: () => void
  stop: () => void
}

declare function usePolling(
  fetchFn: FetchFunction,
  interval?: number
): PollingResult
```