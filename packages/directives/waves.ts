import type { Directive, DirectiveBinding } from 'vue'

interface WavesOptions {
  color?: string
  duration?: number
}

const defaultOptions: WavesOptions = {
  color: 'rgba(255, 255, 255, 0.3)',
  duration: 1000
}

export const vWaves: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding<WavesOptions>) {
    const options = { ...defaultOptions, ...binding.value }
    
    // 设置元素样式
    el.style.position = 'relative'
    el.style.overflow = 'hidden'

    const createRipple = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      // 创建波纹元素
      const ripple = document.createElement('div')
      ripple.className = 'waves-ripple'
      ripple.style.cssText = `
        position: absolute;
        left: ${x}px;
        top: ${y}px;
        width: 0;
        height: 0;
        background: ${options.color};
        border-radius: 50%;
        transform: translate(-50%, -50%);
        pointer-events: none;
        animation: waves-ripple ${options.duration}ms linear;
      `

      // 添加动画样式
      const style = document.createElement('style')
      style.textContent = `
        @keyframes waves-ripple {
          0% {
            width: 0;
            height: 0;
            opacity: 0.5;
          }
          100% {
            width: ${Math.max(rect.width, rect.height) * 2}px;
            height: ${Math.max(rect.width, rect.height) * 2}px;
            opacity: 0;
          }
        }
      `
      document.head.appendChild(style)
      
      el.appendChild(ripple)

      // 动画结束后移除元素
      ripple.addEventListener('animationend', () => {
        ripple.remove()
        style.remove()
      })
    }

    el.addEventListener('click', createRipple)
  },

  unmounted(el: HTMLElement) {
    // 清理所有波纹元素
    const ripples = el.querySelectorAll('.waves-ripple')
    ripples.forEach(ripple => ripple.remove())
  }
} 