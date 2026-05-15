<script setup>
import { ref, watch } from 'vue'
import Piece from './Piece.vue'

const props = defineProps({
  pieces: { type: Array, required: true }
})

const emit = defineEmits(['startDrag'])

const PIECE_COLORS = [
  '#E74C3C', '#E67E22', '#F1C40F', '#2ECC71', '#16A085',
  '#1ABC9C', '#3498DB', '#2980B9', '#9B59B6', '#8E44AD',
  '#E91E63', '#FF5722', '#FF9800', '#CDDC39', '#00BCD4',
  '#03A9F4', '#673AB7', '#FF4081', '#FFC107', '#4CAF50',
  '#009688', '#5C6BC0', '#26A69A', '#EC407A', '#FFA726',
  '#D4E157', '#26C6DA', '#7E57C2', '#F06292', '#FFB74D'
]

// Shuffled colors for current level
const shuffledColors = ref([])

// Fisher-Yates shuffle
function shuffleArray(array) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// Generate shuffled colors when pieces change
watch(() => props.pieces, (newPieces) => {
  if (newPieces && newPieces.length > 0) {
    shuffledColors.value = shuffleArray(PIECE_COLORS).slice(0, newPieces.length)
  }
}, { immediate: true })

function getPieceColor(index) {
  return shuffledColors.value[index] || PIECE_COLORS[index % PIECE_COLORS.length]
}

function handleDragStart(piece, event, pieceWrapper) {
  const pieceEl = pieceWrapper.querySelector('[data-piece="true"]')
  const rect = pieceEl.getBoundingClientRect()
  const color = getPieceColor(piece.id - 1)
  emit('startDrag', piece, event, rect, color)
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
        @mousedown="handleDragStart(piece, $event, $event.currentTarget)"
        @touchstart="handleDragStart(piece, $event, $event.currentTarget)"
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
