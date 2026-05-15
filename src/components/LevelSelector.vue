<script setup>
import { ref, onMounted } from 'vue'
import { useLevels } from '../composables/useLevels.js'

const emit = defineEmits(['select'])

const { levels, getCompletedLevels } = useLevels()
const completedLevels = ref([])

onMounted(() => {
  completedLevels.value = getCompletedLevels()
})

function isCompleted(levelId) {
  return completedLevels.value.includes(levelId)
}
</script>

<template>
  <div class="selector-container">
    <header class="selector-header">
      <h1>Block Puzzle</h1>
      <p>Fill the pool with all pieces</p>
    </header>

    <main class="level-grid">
      <button
        v-for="level in levels"
        :key="level.id"
        class="level-btn"
        :class="{ completed: isCompleted(level.id) }"
        @click="emit('select', level.id)"
      >
        <span class="level-num">{{ level.id }}</span>
        <span v-if="isCompleted(level.id)" class="check">&#10003;</span>
        <span class="level-name">{{ level.name }}</span>
      </button>
    </main>
  </div>
</template>

<style scoped>
.selector-container {
  min-height: 100vh;
  padding: 40px 20px;
  background: #F5F5F5;
}

.selector-header {
  text-align: center;
  margin-bottom: 40px;
}

h1 {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
}

p {
  color: #666;
}

.level-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
  max-width: 600px;
  margin: 0 auto;
}

.level-btn {
  background: white;
  border: 2px solid #E0E0E0;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.level-btn:hover {
  border-color: #4A90D9;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.level-btn.completed {
  border-color: #5CB85C;
  background: #f8fff8;
}

.level-num {
  font-size: 28px;
  font-weight: 700;
  color: #333;
}

.check {
  color: #5CB85C;
  font-size: 18px;
}

.level-name {
  font-size: 13px;
  color: #666;
}
</style>
