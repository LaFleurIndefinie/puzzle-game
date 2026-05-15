<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  levelId: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['back'])
</script>

<template>
  <div class="game-board">
    <div class="header">
      <button @click="emit('back')" class="back-button">Back to Menu</button>
      <h2>Level {{ levelId }}</h2>
    </div>
    <div class="board">
      <p>Game board coming soon...</p>
    </div>
  </div>
</template>

<style scoped>
.game-board {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  min-height: 100vh;
}

.header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.back-button {
  padding: 0.5rem 1rem;
  background: #666;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.back-button:hover {
  background: #555;
}

h2 {
  color: #333;
}

.board {
  width: 100%;
  max-width: 600px;
  aspect-ratio: 1;
  background: white;
  border: 2px solid #ccc;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.board p {
  color: #999;
}
</style>
