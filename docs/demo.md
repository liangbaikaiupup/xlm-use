# 在线演示

这里展示了 xlm-use 工具库的各种功能和使用效果。

## 自定义指令演示

### v-waves 水波纹效果

<div class="demo-section">
  <h4>基础用法</h4>
  <button v-waves class="demo-btn demo-btn-default">
    默认效果
  </button>
  
  <h4>预设主题</h4>
  <button v-waves="'light'" class="demo-btn demo-btn-dark">
    浅色主题
  </button>
  <button v-waves="'dark'" class="demo-btn demo-btn-light">
    深色主题
  </button>
  <button v-waves="'primary'" class="demo-btn demo-btn-primary">
    主色调主题
  </button>
  
  <h4>自定义配置</h4>
  <button v-waves="{ color: '#ff6b6b', opacity: 0.4, duration: 800 }" class="demo-btn demo-btn-custom">
    自定义红色
  </button>
  <button v-waves="{ color: '#4ecdc4', opacity: 0.3, duration: 300 }" class="demo-btn demo-btn-custom">
    自定义青色
  </button>
</div>

### v-debounce 防抖效果

<div class="demo-section">
  <h4>防抖按钮</h4>
  <button v-debounce:click="handleDebounceClick" class="demo-btn demo-btn-default">
    防抖按钮 (500ms)
  </button>
  <span class="click-count">点击次数: {{ clickCount }}</span>
  
  <h4>防抖输入</h4>
  <input 
    v-debounce:input.800="handleDebounceInput" 
    v-model="inputValue"
    placeholder="输入内容 (800ms 防抖)"
    class="demo-input"
  />
  <div class="input-result">输入结果: {{ inputResult }}</div>
  
  <h4>立即执行模式</h4>
  <button v-debounce:click.immediate="handleImmediateClick" class="demo-btn demo-btn-primary">
    立即执行防抖
  </button>
  <span class="click-count">立即执行次数: {{ immediateCount }}</span>
</div>

## 组合式函数演示

### usePolling 轮询功能

<div class="demo-section">
  <h4>数据轮询</h4>
  <div class="polling-controls">
    <button @click="startPolling" :disabled="isPolling" class="demo-btn demo-btn-primary">
      开始轮询
    </button>
    <button @click="stopPolling" :disabled="!isPolling" class="demo-btn demo-btn-default">
      停止轮询
    </button>
  </div>
  
  <div class="polling-status">
    <span v-if="pollingLoading" class="status-loading">🔄 加载中...</span>
    <span v-else-if="pollingError" class="status-error">❌ {{ pollingError.message }}</span>
    <span v-else class="status-success">✅ 数据已更新</span>
  </div>
  
  <div v-if="pollingData" class="polling-data">
    <strong>当前时间:</strong> {{ pollingData.timestamp }}<br>
    <strong>随机数:</strong> {{ pollingData.random }}
  </div>
</div>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// 防抖演示数据
const clickCount = ref(0)
const immediateCount = ref(0)
const inputValue = ref('')
const inputResult = ref('')

// 轮询演示数据
const isPolling = ref(false)
const pollingData = ref(null)
const pollingLoading = ref(false)
const pollingError = ref(null)
let pollingTimer = null

// 防抖事件处理
const handleDebounceClick = () => {
  clickCount.value++
}

const handleImmediateClick = () => {
  immediateCount.value++
}

const handleDebounceInput = (event) => {
  inputResult.value = event.target.value
}

// 轮询功能模拟
const fetchMockData = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        timestamp: new Date().toLocaleTimeString(),
        random: Math.floor(Math.random() * 1000)
      })
    }, 500)
  })
}

const startPolling = async () => {
  if (isPolling.value) return
  
  isPolling.value = true
  pollingError.value = null
  
  const poll = async () => {
    if (!isPolling.value) return
    
    try {
      pollingLoading.value = true
      const data = await fetchMockData()
      pollingData.value = data
      pollingError.value = null
    } catch (error) {
      pollingError.value = error
    } finally {
      pollingLoading.value = false
      
      if (isPolling.value) {
        pollingTimer = setTimeout(poll, 3000)
      }
    }
  }
  
  await poll()
}

const stopPolling = () => {
  isPolling.value = false
  if (pollingTimer) {
    clearTimeout(pollingTimer)
    pollingTimer = null
  }
}

onUnmounted(() => {
  stopPolling()
})
</script>

<style scoped>
.demo-section {
  margin: 24px 0;
  padding: 20px;
  border: 1px solid #e1e4e8;
  border-radius: 8px;
  background: #fafbfc;
}

.demo-btn {
  position: relative;
  padding: 10px 20px;
  margin: 8px 8px 8px 0;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
  font-size: 14px;
}

.demo-btn-default {
  background: #f6f8fa;
  color: #24292e;
  border: 1px solid #d1d5da;
}

.demo-btn-dark {
  background: #24292e;
  color: white;
}

.demo-btn-light {
  background: white;
  color: #24292e;
  border: 1px solid #d1d5da;
}

.demo-btn-primary {
  background: #0366d6;
  color: white;
}

.demo-btn-custom {
  background: #f8f9fa;
  color: #495057;
  border: 1px solid #dee2e6;
}

.demo-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.demo-input {
  width: 300px;
  padding: 8px 12px;
  border: 1px solid #d1d5da;
  border-radius: 6px;
  font-size: 14px;
}

.click-count {
  margin-left: 12px;
  color: #586069;
  font-size: 14px;
}

.input-result {
  margin-top: 8px;
  padding: 8px;
  background: #f1f8ff;
  border-radius: 4px;
  font-size: 14px;
  color: #0366d6;
}

.polling-controls {
  margin-bottom: 16px;
}

.polling-status {
  margin-bottom: 12px;
  font-weight: 500;
}

.status-loading { color: #0366d6; }
.status-error { color: #d73a49; }
.status-success { color: #28a745; }

.polling-data {
  padding: 12px;
  background: #f6f8fa;
  border-radius: 6px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 13px;
  line-height: 1.6;
}
</style>

## 工具函数演示

### toUnderline 命名转换

<div class="demo-section">
  <h4>驼峰转下划线</h4>
  <div class="converter-demo">
    <input 
      v-model="camelCaseInput" 
      placeholder="输入驼峰命名"
      class="demo-input"
    />
    <div class="converter-result">
      <strong>转换结果:</strong> {{ convertedResult }}
    </div>
  </div>
  
  <h4>常见示例</h4>
  <div class="examples">
    <div class="example-item">
      <code>userName</code> → <code>user_name</code>
    </div>
    <div class="example-item">
      <code>firstName</code> → <code>first_name</code>
    </div>
    <div class="example-item">
      <code>getUserInfo</code> → <code>get_user_info</code>
    </div>
  </div>
</div>

<script setup>
import { ref, computed } from 'vue'

// 工具函数演示
const camelCaseInput = ref('userName')

// 模拟 toUnderline 函数
const toUnderline = (str) => {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase()
}

const convertedResult = computed(() => {
  return camelCaseInput.value ? toUnderline(camelCaseInput.value) : ''
})
</script>

<style scoped>
.converter-demo {
  margin-bottom: 20px;
}

.converter-result {
  margin-top: 8px;
  padding: 8px;
  background: #f1f8ff;
  border-radius: 4px;
  font-size: 14px;
  color: #0366d6;
}

.examples {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.example-item {
  padding: 8px;
  background: #f6f8fa;
  border-radius: 4px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 13px;
}

.example-item code {
  background: #fff;
  padding: 2px 4px;
  border-radius: 3px;
  border: 1px solid #e1e4e8;
}
</style>

---

> 💡 **提示**: 这些演示展示了 xlm-use 工具库的核心功能。在实际项目中使用时，请参考相应的文档页面获取完整的 API 说明和配置选项。