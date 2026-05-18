<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useLevels } from '../composables/useLevels.js'

const props = defineProps({
  lastPlayedLevel: { type: Number, default: null },
  savedScrollTop: { type: Number, default: 0 }
})

const emit = defineEmits(['select'])

const { levels, getCompletedLevels } = useLevels()
const completedLevels = ref([])
const gridRef = ref(null)

onMounted(async () => {
  completedLevels.value = getCompletedLevels()

  // Restore scroll position after level selection
  await nextTick()
  if (props.savedScrollTop > 0) {
    window.scrollTo({ top: props.savedScrollTop })
  } else if (props.lastPlayedLevel) {
    scrollToLevel(props.lastPlayedLevel)
  }
})

function isCompleted(levelId) {
  return completedLevels.value.includes(levelId)
}

function scrollToLevel(levelId) {
  if (!levelId || !gridRef.value) return
  const button = gridRef.value.querySelector(`[data-level-id="${levelId}"]`)
  if (button) {
    const rect = button.getBoundingClientRect()
    const scrollTop = window.scrollY + rect.top - window.innerHeight / 2 + rect.height / 2
    window.scrollTo({ top: scrollTop })
  }
}

function handleSelect(levelId) {
  emit('select', levelId, window.scrollY)
}
</script>

<template>
  <div class="selector-container">
    <header class="selector-header">
      <h1>Block Puzzle</h1>
      <p>Put all pieces in the pool!</p>
    </header>

    <main ref="gridRef" class="level-grid">
      <button
        v-for="level in levels"
        :key="level.id"
        :data-level-id="level.id"
        class="level-btn"
        :class="{ completed: isCompleted(level.id) }"
        @click="handleSelect(level.id)"
      >
        <span class="level-num">{{ level.id }}</span>
        <span class="level-name">{{ level.name }}</span>
        <span v-if="isCompleted(level.id)" class="check">&#10003;</span>
      </button>
    </main>
  </div>
</template>

<style scoped>
.selector-container {
  min-height: 100vh;
  padding: 40px 20px;
  background: var(--bg-primary);
  transition: background-color 0.3s;
}

.selector-header {
  text-align: center;
  margin-bottom: 40px;
}

h1 {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
  color: var(--text-primary);
}

p {
  color: var(--text-secondary);
}

.level-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
  max-width: 1920px;
  margin: 0 auto;
  width: 100%;
}

/* Tablet: 6 columns */
@media (max-width: 1200px) {
  .level-grid {
    max-width: 960px;
  }
}

/* Small tablet: 4 columns */
@media (max-width: 768px) {
  .level-grid {
    max-width: 600px;
  }
}

/* Phone: 2-3 columns */
@media (max-width: 480px) {
  .level-grid {
    max-width: 100%;
    gap: 10px;
  }

  .level-btn {
    height: 90px;
    padding: 12px 8px;
  }

  .level-num {
    font-size: 22px;
  }

  .selector-container {
    padding: 20px 12px;
  }
}

.level-btn {
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
  border-radius: 8px;
  padding: 16px 8px;
  cursor: pointer;
  transition: all 0.15s, background-color 0.3s, border-color 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 100px;
  width: 100%;
  box-sizing: border-box;
}

.level-btn:hover {
  border-color: var(--accent-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--shadow);
}

.level-btn.completed {
  border-color: var(--success-color);
  background: var(--bg-secondary);
}

.level-num {
  font-size: 26px;
  font-weight: 700;
  color: var(--text-primary);
}

.check {
  color: var(--success-color);
  font-size: 16px;
}

.level-name {
  font-size: 12px;
  color: var(--text-secondary);
  text-align: center;
}
</style>
