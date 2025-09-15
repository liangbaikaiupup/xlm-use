<script setup lang="ts">
import { ref } from 'vue'
import { vWaves } from '../packages/directives'
import DebounceDemo from './components/DebounceDemo.vue'

const currentDemo = ref('waves') // 'waves', 'debounce'
</script>

<template>
    <div class="app">
      <!-- 演示区 -->
      <div class="demo-container">
      <!-- 导航菜单 -->
      <div class="demo-nav">
        <button 
          @click="currentDemo = 'waves'" 
          :class="{ active: currentDemo === 'waves' }"
          class="nav-btn"
        >
          波纹效果
        </button>
        <button 
          @click="currentDemo = 'debounce'" 
          :class="{ active: currentDemo === 'debounce' }"
          class="nav-btn"
        >
          防抖指令
        </button>

      </div>

      <!-- 波纹效果演示 -->
      <div v-if="currentDemo === 'waves'" class="waves-demo">
        <h1>Vue 3 + TypeScript + Vite</h1>
        <div class="card">
          <button 
            v-waves="{
              color: 'rgba(0, 0, 0, 0.2)',
              duration: 800
            }"
            class="waves-button"
          >
            点击产生波纹效果
          </button>
          <p>
            编辑 <code>src/App.vue</code> 并保存以测试热重载。
          </p>
        </div>
        <p class="read-the-docs">
          点击 Vite 和 Vue 标志了解更多信息
        </p>
      </div>

      <!-- 防抖指令演示 -->
      <div v-if="currentDemo === 'debounce'">
        <DebounceDemo />
      </div>

    </div>
  </div>
</template>

<style scoped>
.app {
  padding: 20px;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}

.demo-container {
  text-align: center;
  max-width: 800px;
  width: 100%;
}

.demo-nav {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.nav-btn {
  padding: 10px 20px;
  font-size: 14px;
  background: #f0f0f0;
  color: #666;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-btn:hover {
  background: #e8e8e8;
  border-color: #d0d0d0;
}

.nav-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: #667eea;
}

.waves-demo {
  text-align: center;
}

.gobang-entry {
  text-align: center;
}

.card {
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin: 2rem 0;
}

.read-the-docs {
  color: #888;
  margin-top: 2rem;
}

.waves-button {
  padding: 12px 24px;
  font-size: 16px;
  color: #333;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.waves-button:hover {
  background: #f8f8f8;
  border-color: #ccc;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.start-game-btn {
  padding: 12px 24px;
  font-size: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.start-game-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}
</style>

