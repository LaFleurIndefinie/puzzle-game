<script setup>
import { computed } from 'vue'

const props = defineProps({
  piece: { type: Object, required: true },
  isDragging: { type: Boolean, default: false },
  cellSize: { type: Number, default: 40 },
  color: { type: String, default: '#4A90D9' }
})

const pieceWidth = computed(() =>
  props.piece.shape[0]?.length * props.cellSize || 0
)
const pieceHeight = computed(() =>
  props.piece.shape.length * props.cellSize || 0
)
</script>

<template>
  <div
    class="piece"
    :class="{ dragging: isDragging, placed: piece.placed }"
    :style="{
      width: pieceWidth + 'px',
      height: pieceHeight + 'px',
      '--piece-color': color
    }"
  >
    <div
      v-for="(row, y) in piece.shape"
      :key="y"
      class="piece-row"
    >
      <div
        v-for="(cell, x) in row"
        :key="x"
        class="piece-cell"
        :class="{ filled: cell === 1 }"
        :style="{ width: cellSize + 'px', height: cellSize + 'px' }"
      />
    </div>
  </div>
</template>

<style scoped>
.piece {
  display: flex;
  flex-direction: column;
  gap: 2px;
  cursor: grab;
  transition: transform 0.15s ease, opacity 0.15s ease;
  user-select: none;
  touch-action: none;
}

.piece:hover {
  transform: scale(1.02);
}

.piece.dragging {
  cursor: grabbing;
  opacity: 0.9;
  z-index: 1000;
  position: fixed;
  pointer-events: none;
}

.piece.placed {
  opacity: 0.5;
  cursor: grab;
}

.piece-row {
  display: flex;
  gap: 2px;
}

.piece-cell {
  border-radius: 4px;
  transition: background-color 0.1s;
}

.piece-cell.filled {
  background-color: var(--piece-color);
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
</style>
