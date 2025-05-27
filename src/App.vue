<script setup lang="ts">
import { vWaves } from '../packages/directives'
</script>

<template>
  <div class="app">
    <button 
      v-waves="{
        color: 'rgba(0, 0, 0, 0.2)',
        duration: 800
      }"
      class="waves-button"
    >
      点击产生波纹效果
    </button>
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
</style>

