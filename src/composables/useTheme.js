import { ref, watch } from 'vue'

const THEME_KEY = 'block-puzzle-theme'

// Load theme from localStorage
const storedTheme = localStorage.getItem(THEME_KEY)
const isDark = ref(storedTheme === 'dark')

export function useTheme() {
  function toggleTheme() {
    isDark.value = !isDark.value
    localStorage.setItem(THEME_KEY, isDark.value ? 'dark' : 'light')
    applyTheme()
  }

  function applyTheme() {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // Apply theme on load and when changed
  watch(isDark, applyTheme, { immediate: true })

  return {
    isDark,
    toggleTheme
  }
}
