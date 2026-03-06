import type { ObjectDirective, DirectiveBinding } from 'vue'

interface DebounceOptions {
  delay?: number
  immediate?: boolean
}

const defaultOptions: DebounceOptions = {
  delay: 300,
  immediate: false
}

// Store state for each element
interface DebounceState {
  handler: (e: Event) => void
  eventType: string
  timer: number | null
}

const stateMap = new WeakMap<HTMLElement, DebounceState>()

export const vDebounce: ObjectDirective = {
  mounted(el: HTMLElement, binding: DirectiveBinding<DebounceOptions | number>) {
    attachDebounce(el, binding)
  },

  updated(el: HTMLElement, binding: DirectiveBinding<DebounceOptions | number>) {
    // Check if value or arg changed
    const state = stateMap.get(el)
    const newEventType = binding.arg || 'click'
    
    if (state && 
        binding.value === binding.oldValue && 
        state.eventType === newEventType) {
      return
    }

    cleanup(el)
    attachDebounce(el, binding)
  },

  unmounted(el: HTMLElement) {
    cleanup(el)
  }
}

function cleanup(el: HTMLElement) {
  const state = stateMap.get(el)
  if (state) {
    el.removeEventListener(state.eventType, state.handler, true)
    if (state.timer) clearTimeout(state.timer)
    stateMap.delete(el)
  }
}

function attachDebounce(el: HTMLElement, binding: DirectiveBinding<DebounceOptions | number>) {
  let options: DebounceOptions
  
  if (typeof binding.value === 'number') {
    options = { ...defaultOptions, delay: binding.value }
  } else {
    options = { ...defaultOptions, ...binding.value }
  }

  const { delay, immediate } = options
  const eventType = binding.arg || 'click'

  const debounceHandler = (event: Event) => {
    // Check if this event was triggered by us (the debounced one)
    if ((event as any).__debounced__) {
      return
    }

    // Stop original event
    event.stopImmediatePropagation()
    event.preventDefault()

    const state = stateMap.get(el)
    const isDebouncing = state && state.timer !== null

    if (isDebouncing) {
      clearTimeout(state!.timer!)
    }

    if (immediate && !isDebouncing) {
      dispatchDebouncedEvent(el, event)
    }

    const timer = window.setTimeout(() => {
      if (!immediate) {
        dispatchDebouncedEvent(el, event)
      }
      // Clear timer ref
      const currentState = stateMap.get(el)
      if (currentState) currentState.timer = null
    }, delay)
    
    // Update state with new timer
    const currentState = stateMap.get(el)
    if (currentState) currentState.timer = timer
  }

  // Attach capture listener
  el.addEventListener(eventType, debounceHandler, true)
  
  // Save state
  stateMap.set(el, {
    handler: debounceHandler,
    eventType,
    timer: null
  })
}

function dispatchDebouncedEvent(target: HTMLElement, originalEvent: Event) {
  let newEvent: Event
  
  // Clone event
  if (typeof MouseEvent !== 'undefined' && originalEvent instanceof MouseEvent) {
      newEvent = new MouseEvent(originalEvent.type, originalEvent)
  } else if (typeof KeyboardEvent !== 'undefined' && originalEvent instanceof KeyboardEvent) {
      newEvent = new KeyboardEvent(originalEvent.type, originalEvent)
  } else {
      newEvent = new Event(originalEvent.type, originalEvent)
  }
  
  // Mark as debounced
  Object.defineProperty(newEvent, '__debounced__', { value: true, enumerable: false })
  
  // Dispatch
  target.dispatchEvent(newEvent)
  
  // Dispatch custom event for compatibility
  target.dispatchEvent(new CustomEvent('debounce-trigger', { detail: originalEvent }))
}
