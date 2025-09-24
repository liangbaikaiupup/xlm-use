# 在线演示

这里展示了 xlm-use 工具库的各种功能和使用效果。

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
import { ref, computed, onUnmounted } from 'vue'

// 轮询演示数据
const isPolling = ref(false)
const pollingData = ref(null)
const pollingLoading = ref(false)
const pollingError = ref(null)
let pollingTimer = null

// 工具函数演示
const camelCaseInput = ref('userName')

// 模拟 toUnderline 函数
const toUnderline = (str) => {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase()
}

const convertedResult = computed(() => {
  return camelCaseInput.value ? toUnderline(camelCaseInput.value) : ''
})

// 模拟数据获取函数
const fetchData = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        timestamp: new Date().toLocaleTimeString(),
        random: Math.floor(Math.random() * 1000)
      })
    }, 500)
  })
}

// 轮询控制函数
const startPolling = async () => {
  if (isPolling.value) return
  
  isPolling.value = true
  pollingError.value = null
  
  const poll = async () => {
    if (!isPolling.value) return
    
    try {
      pollingLoading.value = true
      const data = await fetchData()
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

.demo-btn-primary {
  background: #0366d6;
  color: white;
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