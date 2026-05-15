import { ref } from 'vue'
import levelsData from '../data/levels.json'

const levels = ref(levelsData)
const STORAGE_KEY = 'block-puzzle-completed'

export function useLevels() {
  function loadLevel(id) {
    return levels.value.find(l => l.id === id) || null
  }

  function getCompletedLevels() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  function markCompleted(id) {
    const completed = getCompletedLevels()
    if (!completed.includes(id)) {
      completed.push(id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(completed))
    }
  }

  function resetProgress() {
    localStorage.removeItem(STORAGE_KEY)
  }

  return {
    levels,
    loadLevel,
    getCompletedLevels,
    markCompleted,
    resetProgress
  }
}
