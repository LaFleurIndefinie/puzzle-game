<script setup>
import { ref, computed } from 'vue'
import LevelSelector from './components/LevelSelector.vue'
import GameBoard from './components/GameBoard.vue'
import levelsData from './data/levels.json'
import { useTheme } from './composables/useTheme.js'

const currentLevel = ref(null)
const showLevelSelector = ref(true)
const lastPlayedLevel = ref(null)
const savedScrollTop = ref(0)
const maxLevelId = computed(() => Math.max(...levelsData.map(l => l.id)))
const { isDark, toggleTheme } = useTheme()

function selectLevel(levelId, scrollTop) {
  savedScrollTop.value = scrollTop
  currentLevel.value = levelId
  showLevelSelector.value = false
}

function goToMenu() {
  lastPlayedLevel.value = currentLevel.value
  currentLevel.value = null
  showLevelSelector.value = true
}

function goToNextLevel() {
  const nextLevelId = (currentLevel.value || 1) + 1
  if (nextLevelId <= maxLevelId.value) {
    currentLevel.value = nextLevelId
    showLevelSelector.value = false
  } else {
    goToMenu()
  }
}
</script>

<template>
  <div class="app">
    <div v-if="showLevelSelector" class="theme-toggle">
      <button @click="toggleTheme" class="theme-btn">
        {{ isDark ? '☀️' : '🌙' }}
      </button>
    </div>
    <LevelSelector v-if="showLevelSelector" :lastPlayedLevel="lastPlayedLevel" :savedScrollTop="savedScrollTop" @select="selectLevel" />
    <GameBoard v-else :levelId="currentLevel" :maxLevelId="maxLevelId" @back="goToMenu" @nextLevel="goToNextLevel" />
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.theme-toggle {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 100;
}

.theme-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: var(--bg-secondary);
  box-shadow: 0 2px 8px var(--shadow);
  cursor: pointer;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s, background-color 0.3s;
}

.theme-btn:hover {
  transform: scale(1.1);
}

.theme-btn:active {
  transform: scale(0.95);
}
</style>
