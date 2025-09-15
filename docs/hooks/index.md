# 组合式函数 (Hooks)

xlm-use 提供了一系列实用的 Vue 3 组合式函数，帮助你更高效地处理常见的业务逻辑。

## Hooks 列表

### [useTable](/hooks/table)
表格数据管理组合函数，简化表格的数据获取、分页、排序等操作。

**特性：**
- 📊 自动分页管理
- 🔄 数据刷新机制
- 📱 响应式数据绑定
- 🎯 TypeScript 类型支持

### [usePolling](/hooks/polling)
轮询数据组合函数，实现自动定时获取数据的功能。

**特性：**
- ⏰ 可配置轮询间隔
- 🎯 页面可见性检测
- 🛑 自动停止机制
- 🔄 错误处理和重试

## 基础使用

```typescript
import { useTable, usePolling } from 'xlm-use'
```

## 按需引入

```typescript
// 只引入需要的 hooks
import { useTable } from 'xlm-use/hooks/table'
import { usePolling } from 'xlm-use/hooks/polling'
```

## 使用示例

### 表格管理

```vue
<template>
  <div>
    <el-table :data="tableData" v-loading="loading">
      <el-table-column prop="name" label="姓名" />
      <el-table-column prop="email" label="邮箱" />
    </el-table>
    
    <el-pagination
      v-model:current-page="pagination.current"
      v-model:page-size="pagination.size"
      :total="pagination.total"
      @current-change="handleCurrentChange"
      @size-change="handleSizeChange"
    />
  </div>
</template>

<script setup>
import { useTable } from 'xlm-use'
import { getUserList } from '@/api/user'

const {
  tableData,
  pagination,
  loading,
  handleCurrentChange,
  handleSizeChange,
  refresh
} = useTable({
  pageList: getUserList,
  createdIsNeed: true
})
</script>
```

### 数据轮询

```vue
<template>
  <div>
    <div v-if="loading">加载中...</div>
    <div v-else-if="error">{{ error.message }}</div>
    <div v-else>{{ data }}</div>
    
    <button @click="start">开始轮询</button>
    <button @click="stop">停止轮询</button>
  </div>
</template>

<script setup>
import { usePolling } from 'xlm-use'
import { fetchStatus } from '@/api'

const { data, loading, error, start, stop } = usePolling(
  async (signal) => {
    const response = await fetchStatus({ signal })
    return response.data
  },
  3000 // 3秒轮询间隔
)

// 组件挂载时开始轮询
onMounted(() => {
  start()
})

// 组件卸载时停止轮询
onUnmounted(() => {
  stop()
})
</script>
```

## TypeScript 支持

所有 hooks 都提供完整的 TypeScript 类型定义：

```typescript
import type { BasicTableProps, Pagination } from 'xlm-use'

// 表格配置类型
const tableOptions: BasicTableProps = {
  createdIsNeed: true,
  isPage: true,
  pageList: getUserList
}

// 轮询函数类型
type FetchFunction = (signal: AbortSignal) => Promise<any>
```