<script setup>
const props = defineProps({
  levelId: { type: Number, required: true }
})

const emit = defineEmits(['next', 'replay'])
</script>

<template>
  <div class="overlay">
    <div class="modal">
      <div class="checkmark">&#10003;</div>
      <h2>Level Complete!</h2>
      <p>You filled the pool perfectly.</p>
      <div class="actions">
        <button class="btn secondary" @click="emit('replay')">Replay</button>
        <button class="btn primary" @click="emit('next')">Next Level</button>
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
  background: white;
  padding: 40px;
  border-radius: 16px;
  text-align: center;
  max-width: 320px;
}

.checkmark {
  width: 60px;
  height: 60px;
  background: #5CB85C;
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
}

p {
  color: #666;
  margin-bottom: 24px;
}

.actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: background-color 0.15s;
}

.btn.primary {
  background: #4A90D9;
  color: white;
}

.btn.primary:hover {
  background: #3a7bc8;
}

.btn.secondary {
  background: #E0E0E0;
  color: #333;
}

.btn.secondary:hover {
  background: #d0d0d0;
}
</style>
