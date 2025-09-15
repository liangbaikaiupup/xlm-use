import type { ObjectDirective, DirectiveBinding } from 'vue'

interface DebounceOptions {
  delay?: number
  immediate?: boolean
}

const defaultOptions: DebounceOptions = {
  delay: 300,
  immediate: false
}

// 存储定时器的WeakMap
const timers = new WeakMap<HTMLElement, number>()

export const vDebounce: ObjectDirective = {
  mounted(el: HTMLElement, binding: DirectiveBinding<DebounceOptions | number>) {
    let options: DebounceOptions
    
    // 支持直接传入数字作为延迟时间
    if (typeof binding.value === 'number') {
      options = { ...defaultOptions, delay: binding.value }
    } else {
      options = { ...defaultOptions, ...binding.value }
    }

    const { delay, immediate } = options
    
    // 获取原始事件处理函数（通过类型断言处理动态属性访问）
    const eventProp = `on${binding.arg}` as keyof HTMLElement
    const originalHandler = binding.arg ? (el as any)[eventProp] : null

    // 创建防抖函数
    const debounceHandler = (event: Event) => {
      const timer = timers.get(el)
      
      // 如果设置了immediate且是第一次调用，立即执行
      if (immediate && !timer) {
        if (originalHandler) {
          originalHandler.call(el, event)
        }
        // 触发自定义事件，供父组件监听
        el.dispatchEvent(new CustomEvent('debounce-trigger', { detail: event }))
      }
      
      // 清除之前的定时器
      if (timer) {
        clearTimeout(timer)
      }
      
      // 设置新的定时器
      const newTimer = window.setTimeout(() => {
        if (!immediate) {
          if (originalHandler) {
            originalHandler.call(el, event)
          }
          // 触发自定义事件，供父组件监听
          el.dispatchEvent(new CustomEvent('debounce-trigger', { detail: event }))
        }
        timers.delete(el)
      }, delay)
      
      timers.set(el, newTimer)
    }

    // 确定要监听的事件类型
    const eventType = binding.arg || 'click'
    
    // 添加事件监听器
    el.addEventListener(eventType, debounceHandler)
    
    // 将防抖处理函数存储到元素上，供后续使用
    ;(el as any).__debounceHandler__ = debounceHandler
    ;(el as any).__debounceEventType__ = eventType
  },

  updated(el: HTMLElement, binding: DirectiveBinding<DebounceOptions | number>) {
    // 如果配置发生变化，重新绑定
    const oldHandler = (el as any).__debounceHandler__
    const oldEventType = (el as any).__debounceEventType__
    
    if (oldHandler && oldEventType) {
      el.removeEventListener(oldEventType, oldHandler)
    }
    
    // 清除现有定时器
    const timer = timers.get(el)
    if (timer) {
      clearTimeout(timer)
      timers.delete(el)
    }
    
    // 重新执行mounted逻辑
    let options: DebounceOptions
    
    if (typeof binding.value === 'number') {
      options = { ...defaultOptions, delay: binding.value }
    } else {
      options = { ...defaultOptions, ...binding.value }
    }

    const { delay, immediate } = options
    
    const eventProp = `on${binding.arg}` as keyof HTMLElement
    const originalHandler = binding.arg ? (el as any)[eventProp] : null

    const debounceHandler = (event: Event) => {
      const timer = timers.get(el)
      
      if (immediate && !timer) {
        if (originalHandler) {
          originalHandler.call(el, event)
        }
        el.dispatchEvent(new CustomEvent('debounce-trigger', { detail: event }))
      }
      
      if (timer) {
        clearTimeout(timer)
      }
      
      const newTimer = window.setTimeout(() => {
        if (!immediate) {
          if (originalHandler) {
            originalHandler.call(el, event)
          }
          el.dispatchEvent(new CustomEvent('debounce-trigger', { detail: event }))
        }
        timers.delete(el)
      }, delay)
      
      timers.set(el, newTimer)
    }

    const eventType = binding.arg || 'click'
    
    el.addEventListener(eventType, debounceHandler)
    
    ;(el as any).__debounceHandler__ = debounceHandler
     ;(el as any).__debounceEventType__ = eventType
   },

  unmounted(el: HTMLElement) {
    // 清理事件监听器
    const handler = (el as any).__debounceHandler__
    const eventType = (el as any).__debounceEventType__
    
    if (handler && eventType) {
      el.removeEventListener(eventType, handler)
    }
    
    // 清除定时器
    const timer = timers.get(el)
    if (timer) {
      clearTimeout(timer)
      timers.delete(el)
    }
    
    // 清理存储的引用
    delete (el as any).__debounceHandler__
    delete (el as any).__debounceEventType__
  }
}

// 导出类型定义
export type { DebounceOptions }