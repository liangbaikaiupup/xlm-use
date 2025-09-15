# v-debounce 防抖指令

## 概述

`v-debounce` 是一个 Vue 3 自定义指令，用于防抖处理用户交互事件，避免频繁触发事件处理函数，提升应用性能和用户体验。

## 特性

- 🚀 **高性能**: 使用 WeakMap 存储定时器，避免内存泄漏
- 🎯 **灵活配置**: 支持延迟时间、立即执行等多种配置
- 🔧 **多事件支持**: 支持 click、input、mouseenter 等各种 DOM 事件
- 📱 **响应式**: 支持动态修改配置参数
- 🛡️ **类型安全**: 完整的 TypeScript 类型定义
- 🧹 **自动清理**: 组件卸载时自动清理事件监听器和定时器

## 安装和注册

### 1. 导入指令

```typescript
import { vDebounce } from '@/packages/directives'
```

### 2. 全局注册（可选）

```typescript
// main.ts
import { createApp } from 'vue'
import { vDebounce } from '@/packages/directives'
import App from './App.vue'

const app = createApp(App)
app.directive('debounce', vDebounce)
app.mount('#app')
```

### 3. 局部使用

```vue
<script setup>
import { vDebounce } from '@/packages/directives'
</script>

<template>
  <button v-debounce="300" @click="handleClick">
    点击按钮
  </button>
</template>
```

## 基础用法

### 简单防抖

```vue
<template>
  <!-- 300ms 防抖 -->
  <button v-debounce="300" @click="handleClick">
    基础防抖按钮
  </button>
</template>
```

### 配置对象

```vue
<template>
  <!-- 使用配置对象 -->
  <button 
    v-debounce="{ delay: 500, immediate: true }" 
    @click="handleClick"
  >
    立即执行防抖按钮
  </button>
</template>
```

## 配置选项

### DebounceOptions 接口

```typescript
interface DebounceOptions {
  delay?: number      // 防抖延迟时间，默认 300ms
  immediate?: boolean // 是否立即执行，默认 false
}
```

### 参数说明

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `delay` | `number` | `300` | 防抖延迟时间（毫秒） |
| `immediate` | `boolean` | `false` | 是否在第一次触发时立即执行 |

## 事件类型

### 指定事件类型

使用 `v-debounce:eventType` 语法指定要防抖的事件类型：

```vue
<template>
  <!-- 输入框防抖 -->
  <input 
    v-debounce:input="400"
    v-model="searchText"
    @input="handleSearch"
    placeholder="搜索..."
  />
  
  <!-- 鼠标悬停防抖 -->
  <div 
    v-debounce:mouseenter="200"
    @mouseenter="handleHover"
  >
    悬停区域
  </div>
  
  <!-- 滚动事件防抖 -->
  <div 
    v-debounce:scroll="100"
    @scroll="handleScroll"
    class="scroll-container"
  >
    滚动内容
  </div>
</template>
```

## 使用场景

### 1. 按钮防抖

防止用户快速连续点击按钮：

```vue
<template>
  <button 
    v-debounce="500" 
    @click="submitForm"
    class="submit-btn"
  >
    提交表单
  </button>
</template>

<script setup>
const submitForm = () => {
  console.log('表单提交')
  // 提交逻辑
}
</script>
```

### 2. 搜索输入防抖

避免输入时频繁触发搜索请求：

```vue
<template>
  <input 
    v-debounce:input="{ delay: 400 }"
    v-model="keyword"
    @input="performSearch"
    placeholder="输入关键词搜索..."
  />
</template>

<script setup>
import { ref } from 'vue'

const keyword = ref('')

const performSearch = () => {
  if (keyword.value.trim()) {
    console.log('搜索:', keyword.value)
    // 执行搜索 API 调用
  }
}
</script>
```

### 3. 窗口大小调整防抖

优化窗口 resize 事件处理：

```vue
<template>
  <div 
    v-debounce:resize="250"
    @resize="handleResize"
    ref="containerRef"
  >
    响应式容器
  </div>
</template>

<script setup>
const handleResize = () => {
  console.log('窗口大小改变')
  // 重新计算布局
}
</script>
```

### 4. 立即执行模式

第一次触发立即执行，后续触发防抖：

```vue
<template>
  <button 
    v-debounce="{ delay: 1000, immediate: true }"
    @click="trackUserAction"
  >
    用户行为追踪
  </button>
</template>

<script setup>
const trackUserAction = () => {
  console.log('记录用户行为')
  // 立即记录第一次点击，后续点击防抖
}
</script>
```

### 5. 动态配置

根据条件动态调整防抖参数：

```vue
<template>
  <div>
    <label>防抖延迟: {{ debounceDelay }}ms</label>
    <input 
      v-model.number="debounceDelay" 
      type="range" 
      min="100" 
      max="2000" 
      step="100"
    />
    
    <button 
      v-debounce="debounceDelay"
      @click="handleDynamicClick"
    >
      动态防抖按钮
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const debounceDelay = ref(500)

const handleDynamicClick = () => {
  console.log('动态防抖点击')
}
</script>
```

## 自定义事件

指令会触发 `debounce-trigger` 自定义事件，可以用于监听防抖执行：

```vue
<template>
  <button 
    v-debounce="300"
    @click="handleClick"
    @debounce-trigger="onDebounceTriggered"
  >
    监听防抖事件
  </button>
</template>

<script setup>
const handleClick = () => {
  console.log('原始点击事件')
}

const onDebounceTriggered = (event) => {
  console.log('防抖事件触发:', event.detail)
}
</script>
```

## 最佳实践

### 1. 合理设置延迟时间

- **按钮点击**: 300-500ms
- **输入搜索**: 300-500ms
- **滚动事件**: 100-200ms
- **窗口调整**: 200-300ms

### 2. 选择合适的执行模式

```vue
<!-- 普通防抖：等待用户停止操作后执行 -->
<input v-debounce:input="300" @input="search" />

<!-- 立即执行：第一次立即执行，后续防抖 -->
<button v-debounce="{ delay: 500, immediate: true }" @click="track">
  用户行为追踪
</button>
```

### 3. 避免过度使用

不是所有事件都需要防抖，只在以下情况使用：
- 频繁触发的事件（输入、滚动、调整大小）
- 涉及网络请求的操作
- 计算密集型操作
- 需要避免重复执行的操作

### 4. 性能考虑

```vue
<!-- ✅ 推荐：合理的防抖时间 -->
<input v-debounce:input="300" @input="search" />

<!-- ❌ 避免：过短的防抖时间失去意义 -->
<input v-debounce:input="10" @input="search" />

<!-- ❌ 避免：过长的防抖时间影响用户体验 -->
<input v-debounce:input="5000" @input="search" />
```

## 注意事项

1. **事件监听器**: 指令会自动管理事件监听器的添加和移除
2. **内存管理**: 使用 WeakMap 存储定时器，组件销毁时自动清理
3. **类型安全**: 提供完整的 TypeScript 类型定义
4. **兼容性**: 支持 Vue 3.x 版本
5. **更新处理**: 配置变化时会自动重新绑定事件

## 故障排除

### 常见问题

1. **防抖不生效**
   - 检查事件类型是否正确
   - 确认延迟时间设置合理
   - 验证事件处理函数是否正确绑定

2. **内存泄漏**
   - 指令会自动清理，无需手动处理
   - 确保使用最新版本的指令

3. **TypeScript 错误**
   - 确保正确导入类型定义
   - 检查配置对象的类型是否正确

### 调试技巧

```vue
<template>
  <button 
    v-debounce="{ delay: 300 }"
    @click="debugClick"
    @debounce-trigger="debugTrigger"
  >
    调试按钮
  </button>
</template>

<script setup>
const debugClick = () => {
  console.log('原始点击:', new Date().toISOString())
}

const debugTrigger = (event) => {
  console.log('防抖触发:', new Date().toISOString(), event.detail)
}
</script>
```

## 更新日志

### v1.0.0
- ✨ 初始版本发布
- 🎯 支持基础防抖功能
- 🔧 支持多种事件类型
- 📱 支持动态配置
- 🛡️ 完整的 TypeScript 支持
- 🧹 自动内存管理