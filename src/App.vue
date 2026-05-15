<script setup>
import { ref } from 'vue'
import LevelSelector from './components/LevelSelector.vue'
import GameBoard from './components/GameBoard.vue'

const currentLevel = ref(null)
const showLevelSelector = ref(true)

function selectLevel(levelId) {
  currentLevel.value = levelId
  showLevelSelector.value = false
}

function goToMenu() {
  currentLevel.value = null
  showLevelSelector.value = true
}
</script>

<template>
  <div class="app">
    <LevelSelector v-if="showLevelSelector" @select="selectLevel" />
    <GameBoard v-else :levelId="currentLevel" @back="goToMenu" />
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
