<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useLevels } from '../composables/useLevels.js'
import { useGameState } from '../composables/useGameState.js'
import { useDragDrop } from '../composables/useDragDrop.js'
import { screenToGrid } from '../utils/gridUtils.js'
import PieceTray from './PieceTray.vue'
import LevelComplete from './LevelComplete.vue'

const props = defineProps({
  levelId: { type: Number, required: true },
  maxLevelId: { type: Number, default: 30 }
})

const emit = defineEmits(['back'])

const { loadLevel, markCompleted } = useLevels()
const { pool, pieces, occupiedCells, isComplete, initLevel, placePiece, removePiece, canPlace, getCellColor } = useGameState()
const { dragging, startDrag, updateDrag, endDrag, rotateWhileDragging } = useDragDrop()

const boardRef = ref(null)
const cellSize = 40
const cellGap = 2
const boardPadding = 16
const showComplete = ref(false)

// Pool dimensions - exact size of the grid
const poolDimensions = computed(() => {
  if (!pool.value.length) return { width: 0, height: 0 }
  const cols = pool.value[0].length
  const rows = pool.value.length
  return {
    width: cols * cellSize + (cols - 1) * cellGap,
    height: rows * cellSize + (rows - 1) * cellGap
  }
})

// Position style for the dragging piece
const dragStyle = computed(() => {
  if (!dragging.value) return {}
  return {
    left: (dragging.value.currentX - dragging.value.offsetX) + 'px',
    top: (dragging.value.currentY - dragging.value.offsetY) + 'px'
  }
})

// Current shape being dragged
const activeShape = computed(() => {
  if (!dragging.value) return null
  return dragging.value.rotatedShape
})

// Color of piece being dragged
const dragColor = computed(() => {
  if (!dragging.value) return '#4A90D9'
  return dragging.value.color || '#4A90D9'
})

// ID of piece being dragged (to keep it in layout but hidden)
const draggingPieceId = computed(() => {
  return dragging.value?.pieceId || null
})

// Placed pieces to render on board
const placedPieces = computed(() => {
  return pieces.value.filter(p => p.placed)
})

// Get style for placed piece
function getPlacedPieceStyle(piece) {
  return {
    left: (boardPadding + piece.poolX * (cellSize + cellGap)) + 'px',
    top: (boardPadding + piece.poolY * (cellSize + cellGap)) + 'px',
    position: 'absolute',
    pointerEvents: 'auto'
  }
}

// Indicator style and validity
const indicatorStyle = computed(() => {
  if (!dragging.value || dragging.value.gridX === undefined) return []

  const shape = dragging.value.rotatedShape
  const poolCols = pool.value[0]?.length || 0
  const poolRows = pool.value.length

  // Check if any cell of the shape would be outside pool bounds
  let isInsidePool = true
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x] === 1) {
        const cellX = dragging.value.gridX + x
        const cellY = dragging.value.gridY + y
        if (cellX < 0 || cellX >= poolCols || cellY < 0 || cellY >= poolRows) {
          isInsidePool = false
          break
        }
      }
    }
    if (!isInsidePool) break
  }

  if (!isInsidePool) return []

  const isValid = canPlace(dragging.value.pieceId, dragging.value.gridX, dragging.value.gridY, shape)
  const cells = []

  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x] === 1) {
        const left = boardPadding + (dragging.value.gridX + x) * (cellSize + cellGap)
        const top = boardPadding + (dragging.value.gridY + y) * (cellSize + cellGap)
        cells.push({
          left,
          top,
          width: cellSize - 2,
          height: cellSize - 2,
          isValid
        })
      }
    }
  }

  return cells
})

// Level name
const levelName = ref('')

// Check if a pool cell is filled
function isCellFilled(x, y) {
  return occupiedCells.value.has(`${x},${y}`)
}

function getCellBgColor(x, y) {
  // Check if cell is void (0 in pool)
  const poolCell = pool.value[y]?.[x]
  if (poolCell === 0) return 'transparent'
  // Get the color from occupied cells
  const color = getCellColor(x, y)
  return color || '#E0E0E0'
}

function getCellStyle(x, y) {
  const poolCell = pool.value[y]?.[x]
  if (poolCell === 0) return { backgroundColor: 'transparent', border: 'none' }
  const color = getCellColor(x, y)
  if (color) {
    return { backgroundColor: color, border: '2px solid white' }
  }
  return { backgroundColor: '#E0E0E0' }
}

function initGame() {
  const level = loadLevel(props.levelId)
  if (level) {
    initLevel(level)
    levelName.value = level.name
    showComplete.value = false
  }
}

function resetPieces() {
  // Reset all pieces to original shape and unplace them
  pieces.value.forEach(piece => {
    piece.shape = piece.originalShape.map(row => [...row])
    piece.placed = false
    piece.poolX = null
    piece.poolY = null
    piece.color = null
  })
  // Clear occupied cells
  occupiedCells.value.clear()
  showComplete.value = false
}

function handleStartDrag(piece, event, pieceRect, color) {
  if (piece.placed) {
    removePiece(piece.id)
  }
  startDrag(piece, event, pieceRect, color)
}

// Handle drag start from board (placed pieces)
function handleBoardDragStart(piece, event, pieceEl) {
  const pieceColor = piece.color // Save color before removePiece clears it
  if (piece.placed) {
    removePiece(piece.id)
  }
  if (pieceEl) {
    const rect = pieceEl.getBoundingClientRect()
    startDrag(piece, event, rect, pieceColor)
  }
}

function handleMove(event) {
  if (!dragging.value) return

  const clientX = event.clientX ?? event.touches?.[0]?.clientX
  const clientY = event.clientY ?? event.touches?.[0]?.clientY

  dragging.value.currentX = clientX
  dragging.value.currentY = clientY

  // Calculate grid position based on piece's top-left corner
  const rect = boardRef.value?.getBoundingClientRect()
  if (rect) {
    const pieceLeft = clientX - dragging.value.offsetX
    const pieceTop = clientY - dragging.value.offsetY

    const relX = pieceLeft - rect.left - boardPadding
    const relY = pieceTop - rect.top - boardPadding

    // Use Math.round for magnetic snap feel
    const gridX = Math.round(relX / (cellSize + cellGap))
    const gridY = Math.round(relY / (cellSize + cellGap))

    dragging.value.gridX = gridX
    dragging.value.gridY = gridY
  }
}

function handleEnd() {
  if (!dragging.value) return

  // Save all data before endDrag clears dragging
  const pieceColor = dragColor.value
  const rotatedShape = dragging.value.rotatedShape
  const mouseX = dragging.value.currentX
  const mouseY = dragging.value.currentY
  const offsetX = dragging.value.offsetX
  const offsetY = dragging.value.offsetY

  const result = endDrag()

  if (result) {
    const rect = boardRef.value?.getBoundingClientRect()
    if (rect) {
      const pieceLeft = mouseX - offsetX
      const pieceTop = mouseY - offsetY

      const relX = pieceLeft - rect.left - boardPadding
      const relY = pieceTop - rect.top - boardPadding

      // Use Math.round for magnetic snap feel
      const gridX = Math.round(relX / (cellSize + cellGap))
      const gridY = Math.round(relY / (cellSize + cellGap))

      placePiece(result.pieceId, gridX, gridY, pieceColor, rotatedShape)
    }
  }
}

function handleKeyDown(event) {
  if (dragging.value) {
    if (event.key === 'r' || event.key === 'R') {
      event.preventDefault()
      rotateWhileDragging()
    } else if (event.button === 2) {
      event.preventDefault()
      rotateWhileDragging()
    }
  }
}

function handleContextMenu(event) {
  if (dragging.value) {
    event.preventDefault()
  }
}

watch(isComplete, (complete) => {
  if (complete) {
    markCompleted(props.levelId)
    setTimeout(() => {
      showComplete.value = true
    }, 300)
  }
})

watch(() => props.levelId, () => {
  initGame()
})

onMounted(() => {
  initGame()
  window.addEventListener('mousemove', handleMove)
  window.addEventListener('mouseup', handleEnd)
  window.addEventListener('touchmove', handleMove)
  window.addEventListener('touchend', handleEnd)
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('contextmenu', handleContextMenu)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMove)
  window.removeEventListener('mouseup', handleEnd)
  window.removeEventListener('touchmove', handleMove)
  window.removeEventListener('touchend', handleEnd)
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('contextmenu', handleContextMenu)
})
</script>

<template>
  <div class="game-container">
    <header class="game-header">
      <button class="back-btn" @click="emit('back')">&#8592; Menu</button>
      <h1 class="level-title">Level {{ levelId }}</h1>
      <button class="retry-btn" @click="resetPieces">Retry</button>
    </header>

    <main class="game-main">
      <div class="level-name">{{ levelName }}</div>

      <!-- Pool container -->
      <div ref="boardRef" class="game-board">
        <div v-for="(row, y) in pool" :key="y" class="pool-row">
          <div v-for="(cell, x) in row" :key="x" class="pool-cell"
            :class="{ void: cell === 0 }"
            :style="getCellStyle(x, y)" />
        </div>

        <!-- Drop indicator -->
        <div
          v-for="(cell, idx) in indicatorStyle"
          :key="idx"
          class="drop-indicator"
          :style="{
            left: cell.left + 'px',
            top: cell.top + 'px',
            width: cell.width + 'px',
            height: cell.height + 'px',
            borderColor: cell.isValid ? '#5CB85C' : '#D9534F',
            backgroundColor: cell.isValid ? 'rgba(92, 184, 92, 0.3)' : 'rgba(217, 83, 79, 0.3)'
          }"
        />

        <!-- Placed pieces on board -->
        <div
          v-for="piece in placedPieces"
          :key="'placed-' + piece.id"
          class="placed-piece"
          :style="getPlacedPieceStyle(piece)"
          @mousedown="(e) => handleBoardDragStart(piece, e, e.currentTarget)"
          @touchstart="(e) => handleBoardDragStart(piece, e, e.currentTarget)"
        >
          <div class="piece-grid">
            <div v-for="(row, y) in piece.shape" :key="y" class="piece-row">
              <div
                v-for="(cell, x) in row"
                :key="x"
                class="piece-cell"
                :class="{ filled: cell === 1 }"
                :style="{
                  width: cellSize + 'px',
                  height: cellSize + 'px',
                  backgroundColor: cell === 1 ? piece.color : 'transparent'
                }"
              />
            </div>
          </div>
        </div>

        <!-- Dragging piece overlay -->
        <div v-if="dragging" class="dragging-piece" :style="dragStyle">
          <div class="piece-grid">
            <div v-for="(row, y) in activeShape" :key="y" class="piece-row">
              <div v-for="(cell, x) in row" :key="x" class="piece-cell" :class="{ filled: cell === 1 }" :style="{
                width: cellSize + 'px',
                height: cellSize + 'px',
                backgroundColor: cell === 1 ? dragColor : 'transparent'
              }" />
            </div>
          </div>
        </div>
      </div>

      <div class="hint-text">Press R or right-click to rotate</div>
    </main>

    <PieceTray :pieces="pieces" :dragging-piece-id="draggingPieceId" @startDrag="handleStartDrag" />

    <LevelComplete v-if="showComplete" :levelId="levelId" :maxLevelId="maxLevelId" @home="$emit('back')"
      @next="showComplete = false; $emit('nextLevel')" @replay="initGame(); showComplete = false" />
  </div>
</template>

<style scoped>
.game-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.game-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: white;
  border-bottom: 1px solid #E0E0E0;
}

.back-btn {
  background: none;
  border: none;
  font-size: 16px;
  color: #666;
  cursor: pointer;
  padding: 8px 12px;
}

.back-btn:hover {
  color: #333;
}

.level-title {
  font-size: 18px;
  font-weight: 600;
}

.retry-btn {
  background: #E0E0E0;
  border: none;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 8px;
  transition: background-color 0.15s;
}

.retry-btn:hover {
  background: #d0d0d0;
}

.game-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px 20px;
  gap: 20px;
  min-height: 0;
}

.game-board {
  display: flex;
  flex-direction: column;
  gap: 2px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 16px;
  position: relative;
  flex-shrink: 0;
}

.placed-piece {
  pointer-events: auto;
}

.placed-piece .piece-grid {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.placed-piece .piece-row {
  display: flex;
  gap: 2px;
}

.placed-piece .piece-cell {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  box-sizing: border-box;
  background: transparent;
}

.placed-piece .piece-cell.filled {
  border: 2px solid white;
}

.pool-row {
  display: flex;
  gap: 2px;
}

.pool-cell {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 4px;
  transition: background-color 0.15s;
}

.pool-cell.void {
  background: transparent;
  border: none;
}

.level-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.hint-text {
  font-size: 13px;
  color: #999;
}

.drop-indicator {
  position: absolute;
  border: 2px dashed;
  border-radius: 4px;
  pointer-events: none;
  transition: border-color 0.15s, background-color 0.15s;
  box-sizing: border-box;
}

.dragging-piece {
  position: fixed;
  pointer-events: none;
  z-index: 100;
}

.piece-grid {
  display: flex;
  flex-direction: column;
  gap: 2px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
}

.piece-row {
  display: flex;
  gap: 2px;
}

.piece-cell {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  box-sizing: border-box;
  background: transparent;
}

.piece-cell.filled {
  border: 2px solid white;
}
</style>
