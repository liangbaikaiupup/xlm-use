# v-waves 水波纹指令

为元素添加美观的水波纹点击效果，提升用户交互体验。

## 基础用法

```vue
<template>
  <button v-waves class="btn">
    点击我
  </button>
</template>
```

## 自定义配置

### 颜色配置

```vue
<template>
  <!-- 使用预设颜色 -->
  <button v-waves="'light'" class="btn-dark">
    浅色水波纹
  </button>
  
  <!-- 自定义颜色 -->
  <button v-waves="{ color: '#ff6b6b' }" class="btn">
    红色水波纹
  </button>
</template>
```

### 完整配置

```vue
<template>
  <button v-waves="{
    color: '#4CAF50',
    opacity: 0.3,
    duration: 600
  }" class="btn">
    自定义水波纹
  </button>
</template>
```

## 配置选项

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `color` | `string` | `'rgba(0, 0, 0, 0.15)'` | 水波纹颜色 |
| `opacity` | `number` | `0.15` | 水波纹透明度 |
| `duration` | `number` | `400` | 动画持续时间（毫秒） |

## 预设主题

指令提供了几个预设主题：

```vue
<template>
  <!-- 浅色主题 - 适用于深色背景 -->
  <button v-waves="'light'" class="btn-dark">
    浅色水波纹
  </button>
  
  <!-- 深色主题 - 适用于浅色背景 -->
  <button v-waves="'dark'" class="btn-light">
    深色水波纹
  </button>
  
  <!-- 主色调主题 -->
  <button v-waves="'primary'" class="btn-primary">
    主色调水波纹
  </button>
</template>
```

## 样式要求

使用 v-waves 指令的元素需要设置 `position: relative`：

```css
.btn {
  position: relative;
  overflow: hidden; /* 可选：隐藏超出边界的水波纹 */
}
```

## 完整示例

```vue
<template>
  <div class="demo-container">
    <h3>基础用法</h3>
    <button v-waves class="btn btn-default">
      默认效果
    </button>
    
    <h3>预设主题</h3>
    <button v-waves="'light'" class="btn btn-dark">
      浅色主题
    </button>
    <button v-waves="'dark'" class="btn btn-light">
      深色主题
    </button>
    <button v-waves="'primary'" class="btn btn-primary">
      主色调主题
    </button>
    
    <h3>自定义配置</h3>
    <button v-waves="{
      color: '#ff6b6b',
      opacity: 0.4,
      duration: 800
    }" class="btn btn-custom">
      自定义红色
    </button>
    
    <button v-waves="{
      color: '#4ecdc4',
      opacity: 0.3,
      duration: 300
    }" class="btn btn-custom">
      自定义青色
    </button>
  </div>
</template>

<script setup>
// 无需额外逻辑，指令会自动处理点击事件
</script>

<style scoped>
.demo-container {
  padding: 20px;
}

.btn {
  position: relative;
  padding: 12px 24px;
  margin: 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
}

.btn-default {
  background: #f5f5f5;
  color: #333;
}

.btn-dark {
  background: #333;
  color: white;
}

.btn-light {
  background: white;
  color: #333;
  border: 1px solid #ddd;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-custom {
  background: #f8f9fa;
  color: #495057;
  border: 1px solid #dee2e6;
}
</style>
```

## 注意事项

1. **定位要求**：元素必须设置 `position: relative`
2. **性能优化**：指令会自动清理动画元素，避免内存泄漏
3. **移动端支持**：同时支持鼠标点击和触摸事件
4. **浏览器兼容性**：支持所有现代浏览器

## 实现原理

v-waves 指令通过以下步骤实现水波纹效果：

1. 监听元素的点击/触摸事件
2. 获取点击位置相对于元素的坐标
3. 创建圆形的水波纹元素
4. 使用 CSS 动画实现扩散效果
5. 动画结束后自动清理元素