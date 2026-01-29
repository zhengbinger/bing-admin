import { ref, watch, Ref } from 'vue'

export function useLocalStorage<T>(key: string, defaultValue: T): [Ref<T>, (value: T) => void] {
  const storedValue = localStorage.getItem(key)
  const initialValue = storedValue ? JSON.parse(storedValue) : defaultValue
  
  const state = ref<T>(initialValue)
  
  const setValue = (value: T) => {
    state.value = value
    localStorage.setItem(key, JSON.stringify(value))
  }
  
  watch(
    state,
    (newValue) => {
      localStorage.setItem(key, JSON.stringify(newValue))
    },
    { deep: true }
  )
  
  return [state, setValue]
}

export function useSessionStorage<T>(key: string, defaultValue: T): [Ref<T>, (value: T) => void] {
  const storedValue = sessionStorage.getItem(key)
  const initialValue = storedValue ? JSON.parse(storedValue) : defaultValue
  
  const state = ref<T>(initialValue)
  
  const setValue = (value: T) => {
    state.value = value
    sessionStorage.setItem(key, JSON.stringify(value))
  }
  
  watch(
    state,
    (newValue) => {
      sessionStorage.setItem(key, JSON.stringify(newValue))
    },
    { deep: true }
  )
  
  return [state, setValue]
}