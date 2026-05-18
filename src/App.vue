<script setup>
import { ref, computed } from 'vue'
import LevelSelector from './components/LevelSelector.vue'
import GameBoard from './components/GameBoard.vue'
import levelsData from './data/levels.json'

const currentLevel = ref(null)
const showLevelSelector = ref(true)
const lastPlayedLevel = ref(null)
const savedScrollTop = ref(0)
const maxLevelId = computed(() => Math.max(...levelsData.map(l => l.id)))

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
</style>
