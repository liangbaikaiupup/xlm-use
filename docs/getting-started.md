# 快速开始

## 安装

使用 npm、yarn 或 pnpm 安装：

```bash
# npm
npm install xlm-use

# yarn
yarn add xlm-use

# pnpm
pnpm add xlm-use
```

## 基础使用

### 全局注册指令

在你的 Vue 应用中全局注册指令：

```typescript
import { createApp } from 'vue'
import App from './App.vue'
import { vWaves, vDebounce } from 'xlm-use'

const app = createApp(App)

// 注册指令
app.directive('waves', vWaves)
app.directive('debounce', vDebounce)

app.mount('#app')
```

### 使用组合式函数

```vue
<template>
  <div>
    <el-table :data="tableData" v-loading="loading">
      <!-- 表格列定义 -->
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

<script setup lang="ts">
import { useTable } from 'xlm-use'
import { getUserList } from '@/api/user'

// 使用表格组合函数
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

### 使用轮询功能

```vue
<script setup lang="ts">
import { usePolling } from 'xlm-use'
import { fetchData } from '@/api'

// 使用轮询功能
const { data, loading, error, start, stop } = usePolling(
  async (signal) => {
    const response = await fetchData({ signal })
    return response.data
  },
  5000 // 5秒轮询间隔
)

// 开始轮询
start()

// 组件卸载时停止轮询
onUnmounted(() => {
  stop()
})
</script>
```

## 按需引入

为了减少打包体积，推荐按需引入：

```typescript
// 只引入需要的功能
import { vWaves } from 'xlm-use/directives'
import { useTable } from 'xlm-use/hooks'
import { toUnderline } from 'xlm-use/utils'
```

## TypeScript 支持

xlm-use 完全支持 TypeScript，提供完整的类型定义：

```typescript
import type { BasicTableProps, Pagination } from 'xlm-use'

const tableOptions: BasicTableProps = {
  createdIsNeed: true,
  isPage: true,
  pageList: getUserList
}
```

## 下一步

- 查看 [指令文档](/directives/) 了解可用的自定义指令
- 查看 [Hooks 文档](/hooks/) 了解组合式函数
- 查看 [工具函数文档](/utils/) 了解实用工具
- 查看 [在线演示](/demo) 体验功能效果