<script setup>
import Piece from './Piece.vue'

const props = defineProps({
  pieces: { type: Array, required: true }
})

const emit = defineEmits(['startDrag'])

const PIECE_COLORS = ['#4A90D9', '#5CB85C', '#D9A441', '#9B59B6', '#1ABC9C']

function getPieceColor(index) {
  return PIECE_COLORS[index % PIECE_COLORS.length]
}

function handleDragStart(piece, event) {
  const rect = event.currentTarget.getBoundingClientRect()
  emit('startDrag', piece, event, rect)
}
</script>

<template>
  <div class="piece-tray">
    <div class="tray-label">Pieces</div>
    <div class="pieces-container">
      <div
        v-for="(piece, index) in pieces"
        :key="piece.id"
        class="piece-wrapper"
        @mousedown="handleDragStart(piece, $event)"
        @touchstart="handleDragStart(piece, $event)"
      >
        <Piece
          :piece="piece"
          :color="getPieceColor(piece.id - 1)"
          :cell-size="40"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.piece-tray {
  background: #FAFAFA;
  padding: 20px;
  border-top: 1px solid #E0E0E0;
}

.tray-label {
  font-size: 12px;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 12px;
}

.pieces-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
  min-height: 80px;
}

.piece-wrapper {
  cursor: grab;
}

.piece-wrapper:active {
  cursor: grabbing;
}
</style>
