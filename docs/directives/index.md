# 自定义指令

xlm-use 提供了一系列实用的 Vue 3 自定义指令，帮助你快速实现常见的交互效果。

## 指令列表

### [v-waves](/directives/waves)
水波纹点击效果指令，为按钮和可点击元素添加美观的水波纹动画。

**特性：**
- 🎨 自定义颜色和透明度
- ⚡ 高性能动画实现
- 📱 支持移动端触摸
- 🎯 自动适配元素大小

### [v-debounce](/directives/debounce)
防抖指令，防止用户频繁点击或输入触发过多的事件。

**特性：**
- ⏱️ 可配置延迟时间
- 🎯 支持多种事件类型
- 🚀 立即执行模式
- 🛡️ 自动清理机制

## 全局注册

```typescript
import { createApp } from 'vue'
import { vWaves, vDebounce } from 'xlm-use'

const app = createApp(App)

app.directive('waves', vWaves)
app.directive('debounce', vDebounce)

app.mount('#app')
```

## 按需引入

```typescript
// 只引入需要的指令
import { vWaves } from 'xlm-use/directives/waves'
import { vDebounce } from 'xlm-use/directives/debounce'
```

## 使用示例

```vue
<template>
  <!-- 水波纹效果 -->
  <button v-waves class="btn-primary">
    点击我
  </button>
  
  <!-- 防抖点击 -->
  <button v-debounce:click="handleClick">
    防抖按钮
  </button>
  
  <!-- 防抖输入 -->
  <input v-debounce:input.500="handleInput" placeholder="输入内容" />
</template>

<script setup>
const handleClick = () => {
  console.log('按钮被点击')
}

const handleInput = (event) => {
  console.log('输入内容:', event.target.value)
}
</script>
```