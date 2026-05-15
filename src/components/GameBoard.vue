<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useLevels } from '../composables/useLevels.js'
import { useGameState } from '../composables/useGameState.js'
import { useDragDrop } from '../composables/useDragDrop.js'
import { screenToGrid } from '../utils/gridUtils.js'
import PieceTray from './PieceTray.vue'
import LevelComplete from './LevelComplete.vue'

const props = defineProps({
  levelId: { type: Number, required: true }
})

const emit = defineEmits(['back'])

const { loadLevel, markCompleted } = useLevels()
const { pool, pieces, occupiedCells, isComplete, initLevel, placePiece, removePiece, canPlace, rotatePiece } = useGameState()
const { dragging, startDrag, updateDrag, endDrag, rotateWhileDragging } = useDragDrop()

const boardRef = ref(null)
const cellSize = 40
const showComplete = ref(false)

const poolDimensions = computed(() => {
  if (!pool.value.length) return { width: 0, height: 0 }
  return {
    width: pool.value[0].length * cellSize,
    height: pool.value.length * cellSize
  }
})

const dragStyle = computed(() => {
  if (!dragging.value) return {}
  return {
    left: (dragging.value.currentX - dragging.value.offsetX) + 'px',
    top: (dragging.value.currentY - dragging.value.offsetY) + 'px',
    transform: `rotate(${dragging.value.rotation}deg)`
  }
})

const activeShape = computed(() => {
  if (!dragging.value) return null
  return dragging.value.rotatedShape
})

function isCellFilled(x, y) {
  return occupiedCells.value.has(`${x},${y}`)
}

function initGame() {
  const level = loadLevel(props.levelId)
  if (level) {
    initLevel(level)
    showComplete.value = false
  }
}

function handleStartDrag(piece, event, pieceRect) {
  if (piece.placed) {
    removePiece(piece.id)
  }
  startDrag(piece, event, pieceRect)
}

function handleMove(event) {
  if (!dragging.value) return
  updateDrag(event)

  const rect = boardRef.value?.getBoundingClientRect()
  if (!rect) return

  const { gridX, gridY } = screenToGrid(
    event.clientX,
    event.clientY,
    rect,
    cellSize
  )

  dragging.value.gridX = gridX
  dragging.value.gridY = gridY
}

function handleEnd() {
  if (!dragging.value) return

  const result = endDrag()
  if (result && result.gridX !== undefined) {
    const piece = pieces.value.find(p => p.id === result.pieceId)
    if (piece) {
      const originalShape = piece.shape.map(row => [...row])
      piece.shape = result.rotatedShape

      if (!placePiece(result.pieceId, result.gridX, result.gridY)) {
        piece.shape = originalShape
      }
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
      <div class="spacer"></div>
    </header>

    <main class="game-main">
      <div
        ref="boardRef"
        class="game-board"
        :style="{ width: poolDimensions.width + 'px', height: poolDimensions.height + 'px' }"
      >
        <div
          v-for="(row, y) in pool"
          :key="y"
          class="pool-row"
        >
          <div
            v-for="(cell, x) in row"
            :key="x"
            class="pool-cell"
            :class="{ valid: cell === 1, filled: isCellFilled(x, y) }"
            :style="{ width: cellSize + 'px', height: cellSize + 'px' }"
          />
        </div>

        <!-- Drop indicator overlay -->
        <div
          v-if="dragging && dragging.gridX !== undefined"
          class="drop-indicator"
          :class="{ valid: canPlace(dragging.pieceId, dragging.gridX, dragging.gridY) }"
          :style="{
            left: (dragging.gridX * cellSize) + 'px',
            top: (dragging.gridY * cellSize) + 'px',
            width: (activeShape[0]?.length * cellSize) + 'px',
            height: (activeShape.length * cellSize) + 'px'
          }"
        />

        <!-- Dragging piece overlay -->
        <div
          v-if="dragging"
          class="dragging-piece"
          :style="dragStyle"
        >
          <div class="piece-grid">
            <div
              v-for="(row, y) in activeShape"
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
        </div>
      </div>

      <div class="hint-text">Press R or right-click to rotate</div>
    </main>

    <PieceTray
      :pieces="pieces"
      @startDrag="handleStartDrag"
    />

    <LevelComplete
      v-if="showComplete"
      :levelId="levelId"
      @next="initGame(); $emit('back')"
      @replay="initGame(); showComplete = false"
    />
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

.spacer {
  width: 80px;
}

.game-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.game-board {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px;
  position: relative;
}

.pool-row {
  display: flex;
  gap: 2px;
}

.pool-cell {
  border-radius: 4px;
  transition: background-color 0.15s;
}

.pool-cell.valid {
  background: #E0E0E0;
}

.pool-cell.filled {
  background: #4A90D9;
}

.hint-text {
  margin-top: 20px;
  font-size: 13px;
  color: #999;
}

.drop-indicator {
  position: absolute;
  border: 3px dashed #ccc;
  border-radius: 6px;
  pointer-events: none;
  transition: border-color 0.15s, background-color 0.15s;
}

.drop-indicator.valid {
  border-color: #5CB85C;
  background: rgba(92, 184, 92, 0.15);
}

.dragging-piece {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 100;
}

.piece-grid {
  display: flex;
  flex-direction: column;
  gap: 2px;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
}

.piece-row {
  display: flex;
  gap: 2px;
}

.piece-cell {
  border-radius: 4px;
}

.piece-cell.filled {
  background: #4A90D9;
  border: 2px solid white;
}
</style>
