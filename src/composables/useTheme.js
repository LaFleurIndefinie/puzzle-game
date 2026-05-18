import { ref, watch } from 'vue'

const isDark = ref(false)

export function useTheme() {
  function toggleTheme() {
    isDark.value = !isDark.value
    applyTheme()
  }

  function applyTheme() {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // Apply theme on load
  watch(isDark, applyTheme, { immediate: true })

  return {
    isDark,
    toggleTheme
  }
}
