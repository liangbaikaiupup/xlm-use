<template>
  <div class="debounce-demo">
    <h2>v-debounce 防抖指令演示</h2>
    
    <!-- 基础用法 -->
    <div class="demo-section">
      <h3>基础用法</h3>
      <p>点击按钮，300ms内的重复点击会被防抖</p>
      <button 
        v-debounce="300" 
        @click="handleClick('基础防抖')"
        class="demo-btn"
      >
        基础防抖按钮 (300ms)
      </button>
      <p class="result">点击次数: {{ clickCount.basic }}</p>
    </div>

    <!-- 立即执行模式 -->
    <div class="demo-section">
      <h3>立即执行模式</h3>
      <p>第一次点击立即执行，后续点击在500ms内会被防抖</p>
      <button 
        v-debounce="{ delay: 500, immediate: true }" 
        @click="handleClick('立即执行')"
        class="demo-btn immediate"
      >
        立即执行防抖按钮 (500ms)
      </button>
      <p class="result">点击次数: {{ clickCount.immediate }}</p>
    </div>

    <!-- 输入框防抖 -->
    <div class="demo-section">
      <h3>输入框防抖</h3>
      <p>输入时会防抖处理，避免频繁触发搜索</p>
      <input 
        v-debounce:input="{ delay: 400 }"
        v-model="searchText"
        @input="handleSearch"
        placeholder="输入搜索内容..."
        class="demo-input"
      />
      <p class="result">搜索触发次数: {{ searchCount }}</p>
      <p class="result">当前搜索内容: {{ searchText }}</p>
    </div>

    <!-- 自定义事件防抖 -->
    <div class="demo-section">
      <h3>鼠标悬停防抖</h3>
      <p>鼠标悬停事件防抖，避免频繁触发</p>
      <div 
        v-debounce:mouseenter="200"
        @mouseenter="handleHover"
        class="hover-area"
      >
        鼠标悬停区域 (200ms防抖)
      </div>
      <p class="result">悬停触发次数: {{ hoverCount }}</p>
    </div>

    <!-- 动态配置 -->
    <div class="demo-section">
      <h3>动态配置</h3>
      <p>可以动态修改防抖延迟时间</p>
      <div class="config-controls">
        <label>延迟时间: </label>
        <input 
          v-model.number="dynamicDelay" 
          type="range" 
          min="100" 
          max="2000" 
          step="100"
        />
        <span>{{ dynamicDelay }}ms</span>
      </div>
      <button 
        v-debounce="dynamicDelay" 
        @click="handleClick('动态配置')"
        class="demo-btn dynamic"
      >
        动态防抖按钮
      </button>
      <p class="result">点击次数: {{ clickCount.dynamic }}</p>
    </div>

    <!-- 重置按钮 -->
    <div class="demo-section">
      <button @click="resetCounters" class="reset-btn">
        重置所有计数器
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { vDebounce } from '../../packages/directives'

// 计数器
const clickCount = reactive({
  basic: 0,
  immediate: 0,
  dynamic: 0
})

const searchCount = ref(0)
const hoverCount = ref(0)
const searchText = ref('')
const dynamicDelay = ref(500)

// 事件处理函数
const handleClick = (type: string) => {
  console.log(`${type} 按钮被点击`)
  
  switch (type) {
    case '基础防抖':
      clickCount.basic++
      break
    case '立即执行':
      clickCount.immediate++
      break
    case '动态配置':
      clickCount.dynamic++
      break
  }
}

const handleSearch = () => {
  console.log('搜索触发:', searchText.value)
  searchCount.value++
}

const handleHover = () => {
  console.log('鼠标悬停触发')
  hoverCount.value++
}

const resetCounters = () => {
  clickCount.basic = 0
  clickCount.immediate = 0
  clickCount.dynamic = 0
  searchCount.value = 0
  hoverCount.value = 0
  searchText.value = ''
}
</script>

<style scoped>
.debounce-demo {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.debounce-demo h2 {
  color: #2c3e50;
  text-align: center;
  margin-bottom: 30px;
}

.demo-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  background: #f8f9fa;
}

.demo-section h3 {
  color: #34495e;
  margin-top: 0;
  margin-bottom: 10px;
}

.demo-section p {
  color: #666;
  margin-bottom: 15px;
  line-height: 1.5;
}

.demo-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-right: 10px;
}

.demo-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.demo-btn:active {
  transform: translateY(0);
}

.demo-btn.immediate {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.demo-btn.immediate:hover {
  box-shadow: 0 4px 12px rgba(240, 147, 251, 0.4);
}

.demo-btn.dynamic {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.demo-btn.dynamic:hover {
  box-shadow: 0 4px 12px rgba(79, 172, 254, 0.4);
}

.demo-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e1e8ed;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.demo-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.hover-area {
  width: 100%;
  height: 100px;
  border: 2px dashed #667eea;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  cursor: pointer;
  transition: all 0.3s ease;
  color: #667eea;
  font-weight: 500;
}

.hover-area:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
  transform: scale(1.02);
}

.config-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.config-controls label {
  font-weight: 500;
  color: #34495e;
}

.config-controls input[type="range"] {
  flex: 1;
  max-width: 200px;
}

.config-controls span {
  font-weight: 500;
  color: #667eea;
  min-width: 60px;
}

.result {
  background: #e8f4fd;
  border: 1px solid #b3d9f7;
  border-radius: 4px;
  padding: 8px 12px;
  margin: 10px 0;
  color: #1976d2;
  font-weight: 500;
}

.reset-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.reset-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
}

.reset-btn:active {
  transform: translateY(0);
}
</style>