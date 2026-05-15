<script setup>
const emit = defineEmits(['select'])

const levels = [
  { id: 1, name: 'Level 1', difficulty: 'Easy' },
  { id: 2, name: 'Level 2', difficulty: 'Medium' },
  { id: 3, name: 'Level 3', difficulty: 'Hard' }
]

function selectLevel(levelId) {
  emit('select', levelId)
}
</script>

<template>
  <div class="level-selector">
    <h1>Block Puzzle</h1>
    <div class="levels">
      <button
        v-for="level in levels"
        :key="level.id"
        @click="selectLevel(level.id)"
        class="level-button"
      >
        {{ level.name }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.level-selector {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
}

h1 {
  margin-bottom: 2rem;
  color: #333;
}

.levels {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.level-button {
  padding: 1rem 2rem;
  font-size: 1rem;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.level-button:hover {
  background: #45a049;
}
</style>
