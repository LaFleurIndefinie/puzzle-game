<script setup>
import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue'
import Piece from './Piece.vue'

const props = defineProps({
  pieces: { type: Array, required: true },
  draggingPieceId: { type: [Number, null], default: null }
})

const emit = defineEmits(['startDrag'])

const containerRef = ref(null)

// Calculate container height based on tallest piece
const containerHeight = computed(() => {
  let maxHeight = 100 // default min height
  props.pieces.forEach(piece => {
    const pieceHeight = piece.shape.length * 40 + (piece.shape.length - 1) * 2
    if (pieceHeight > maxHeight) {
      maxHeight = pieceHeight
    }
  })
  return maxHeight + 20 // enough to show tallest piece
})

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
    // Find max piece id to determine how many colors we need
    const maxId = Math.max(...newPieces.map(p => p.id))
    shuffledColors.value = shuffleArray(PIECE_COLORS).slice(0, maxId)
  }
}, { immediate: true })

function getPieceColor(index) {
  return shuffledColors.value[index] || PIECE_COLORS[index % PIECE_COLORS.length]
}

function handleDragStart(piece, event, pieceEl, color) {
  if (!pieceEl) return
  const rect = pieceEl.getBoundingClientRect()
  emit('startDrag', piece, event, rect, color)
}

function handleWheel(event) {
  if (containerRef.value) {
    event.preventDefault()
    containerRef.value.scrollLeft += event.deltaY * 2
  }
}

onMounted(() => {
  if (containerRef.value) {
    containerRef.value.addEventListener('wheel', handleWheel, { passive: false })
  }
})

onBeforeUnmount(() => {
  if (containerRef.value) {
    containerRef.value.removeEventListener('wheel', handleWheel)
  }
})
</script>

<template>
  <div class="piece-tray">
    <div class="tray-label">Pieces</div>
    <div class="scroll-wrapper" :style="{ height: containerHeight + 'px' }">
      <div ref="containerRef" class="pieces-container" :style="{ height: containerHeight + 'px' }">
        <div
          v-for="(piece, index) in pieces"
          :key="piece.id"
          class="piece-wrapper"
          :class="{ 'piece-hidden': piece.placed || piece.id === draggingPieceId }"
        >
          <Piece
            :piece="piece"
            :color="shuffledColors[piece.id - 1] || PIECE_COLORS[(piece.id - 1) % PIECE_COLORS.length]"
            :cell-size="40"
            @drag-start="(e, el) => handleDragStart(piece, e, el, shuffledColors[piece.id - 1] || PIECE_COLORS[(piece.id - 1) % PIECE_COLORS.length])"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.piece-tray {
  background: var(--bg-tertiary);
  padding: 20px;
  border-top: 1px solid var(--border-color);
  pointer-events: auto;
  transition: background-color 0.3s, border-color 0.3s;
}

.tray-label {
  font-size: 12px;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 12px;
}

.scroll-wrapper {
  overflow: hidden;
}

.pieces-container {
  display: flex;
  flex-direction: row;
  gap: 20px;
  justify-content: flex-start;
  align-items: center;
  pointer-events: auto;
  width: 100%;
  box-sizing: border-box;
  overflow-x: scroll;
  overflow-y: hidden;
  scroll-behavior: smooth;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.pieces-container::-webkit-scrollbar {
  height: 0;
}

.pieces-container::-webkit-scrollbar-thumb {
  height: 0;
  background: transparent;
}

.pieces-container::-webkit-scrollbar-track {
  height: 0;
  background: transparent;
}

.piece-wrapper {
  cursor: grab;
  flex-shrink: 0;
}

.piece-wrapper:active {
  cursor: grabbing;
}

.piece-hidden {
  visibility: hidden;
  width: 0;
  margin: 0;
  padding: 0;
}
</style>
