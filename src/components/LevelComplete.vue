<script setup>
const props = defineProps({
  levelId: { type: Number, required: true },
  maxLevelId: { type: Number, default: 30 }
})

const emit = defineEmits(['home', 'next', 'replay'])

const hasNextLevel = props.levelId < props.maxLevelId
</script>

<template>
  <div class="overlay">
    <div class="modal">
      <div class="checkmark">&#10003;</div>
      <h2>Level Complete!</h2>
      <p>You filled the pool perfectly.</p>
      <div class="actions">
        <button class="btn secondary" @click="emit('replay')">Replay</button>
        <button class="btn home" @click="emit('home')">Home</button>
        <button v-if="hasNextLevel" class="btn primary" @click="emit('next')">Next</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: var(--bg-secondary);
  padding: 40px;
  border-radius: 16px;
  text-align: center;
  max-width: 320px;
  transition: background-color 0.3s;
}

.checkmark {
  width: 60px;
  height: 60px;
  background: var(--success-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  margin: 0 auto 20px;
}

h2 {
  font-size: 24px;
  margin-bottom: 8px;
  color: var(--text-primary);
}

p {
  color: var(--text-secondary);
  margin-bottom: 24px;
}

.actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: background-color 0.15s, opacity 0.15s;
  white-space: nowrap;
}

.btn.primary {
  background: var(--accent-color);
  color: white;
}

.btn.primary:hover {
  background: var(--accent-hover);
}

.btn.secondary {
  background: var(--border-color);
  color: var(--text-primary);
}

.btn.secondary:hover {
  opacity: 0.8;
}

.btn.home {
  background: var(--accent-color);
  color: white;
}

.btn.home:hover {
  background: var(--accent-hover);
}
</style>
