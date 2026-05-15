# Block Puzzle Game Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Vue 3 puzzle game where players drag Tetris-like pieces into an irregular pool to fill all cells.

**Architecture:** Vue 3 + Vite with Composition API. Pointer events for unified mouse/touch drag. Grid-based collision detection. JSON-defined levels with localStorage persistence.

**Tech Stack:** Vue 3, Vite, Vanilla CSS, localStorage

---

## File Structure

```
d:\puzzle-game\
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.js
│   ├── App.vue
│   ├── style.css
│   ├── components/
│   │   ├── GameBoard.vue
│   │   ├── Piece.vue
│   │   ├── PieceTray.vue
│   │   ├── LevelComplete.vue
│   │   └── LevelSelector.vue
│   ├── composables/
│   │   ├── useGameState.js
│   │   ├── useDragDrop.js
│   │   └── useLevels.js
│   ├── data/
│   │   └── levels.json
│   └── utils/
│       └── gridUtils.js
└── public/
```

---

## Task 1: Project Setup

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `index.html`
- Create: `src/main.js`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "block-puzzle-game",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.4.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "vite": "^5.0.0"
  }
}
```

- [ ] **Step 2: Create vite.config.js**

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()]
})
```

- [ ] **Step 3: Create index.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Block Puzzle</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

- [ ] **Step 4: Create src/main.js**

```javascript
import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

createApp(App).mount('#app')
```

- [ ] **Step 5: Create src/style.css**

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  background: #F5F5F5;
  min-height: 100vh;
}

#app {
  min-height: 100vh;
}
```

- [ ] **Step 6: Create src/App.vue**

```vue
<script setup>
import { ref } from 'vue'
import LevelSelector from './components/LevelSelector.vue'
import GameBoard from './components/GameBoard.vue'

const currentLevel = ref(null)
const showLevelSelector = ref(true)

function selectLevel(levelId) {
  currentLevel.value = levelId
  showLevelSelector.value = false
}

function goToMenu() {
  currentLevel.value = null
  showLevelSelector.value = true
}
</script>

<template>
  <div class="app">
    <LevelSelector v-if="showLevelSelector" @select="selectLevel" />
    <GameBoard v-else :levelId="currentLevel" @back="goToMenu" />
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
```

- [ ] **Step 7: Install dependencies**

Run: `cd d:\puzzle-game && npm install`
Expected: Dependencies installed, node_modules created

- [ ] **Step 8: Test dev server**

Run: `cd d:\puzzle-game && npm run dev`
Expected: Vite dev server starts without errors

- [ ] **Step 9: Commit**

```bash
git init
git add package.json vite.config.js index.html src/main.js src/style.css src/App.vue
git commit -m "feat: project setup with Vue 3 and Vite"
```

---

## Task 2: Grid Utilities

**Files:**
- Create: `src/utils/gridUtils.js`
- Create: `tests/utils/gridUtils.test.js`

- [ ] **Step 1: Create gridUtils.js**

```javascript
/**
 * Rotate a 2D array 90 degrees clockwise
 */
export function rotate90(shape) {
  const rows = shape.length
  const cols = shape[0]?.length || 0
  const rotated = []
  
  for (let col = 0; col < cols; col++) {
    const newRow = []
    for (let row = rows - 1; row >= 0; row--) {
      newRow.push(shape[row][col])
    }
    rotated.push(newRow)
  }
  
  return rotated
}

/**
 * Check if piece can be placed at position
 */
export function canPlacePiece(piece, poolX, poolY, pool, occupiedCells) {
  for (let py = 0; py < piece.shape.length; py++) {
    for (let px = 0; px < piece.shape[py].length; px++) {
      if (piece.shape[py][px] === 1) {
        const gridX = poolX + px
        const gridY = poolY + py

        // Check bounds
        if (gridY < 0 || gridY >= pool.length) return false
        if (gridX < 0 || gridX >= pool[0].length) return false

        // Check pool shape (0 = void)
        if (pool[gridY][gridX] === 0) return false

        // Check already occupied
        if (occupiedCells.has(`${gridX},${gridY}`)) return false
      }
    }
  }
  return true
}

/**
 * Get all cells occupied by a piece at given position
 */
export function getPieceCells(piece, poolX, poolY) {
  const cells = []
  for (let py = 0; py < piece.shape.length; py++) {
    for (let px = 0; px < piece.shape[py].length; px++) {
      if (piece.shape[py][px] === 1) {
        cells.push({ x: poolX + px, y: poolY + py })
      }
    }
  }
  return cells
}

/**
 * Count total cells in a shape
 */
export function countCells(shape) {
  return shape.flat().reduce((sum, cell) => sum + cell, 0)
}

/**
 * Convert screen coordinates to grid coordinates
 */
export function screenToGrid(screenX, screenY, poolRect, cellSize) {
  const gridX = Math.floor((screenX - poolRect.left) / cellSize)
  const gridY = Math.floor((screenY - poolRect.top) / cellSize)
  return { gridX, gridY }
}
```

- [ ] **Step 2: Create test file and write first failing test**

Run: `mkdir -p d:\puzzle-game\tests\utils`

```javascript
import { describe, it, expect } from 'vitest'
import { rotate90, canPlacePiece, getPieceCells, countCells } from '../../src/utils/gridUtils.js'

describe('rotate90', () => {
  it('rotates a 2x3 matrix clockwise', () => {
    const shape = [
      [1, 1, 1],
      [1, 0, 0]
    ]
    const rotated = rotate90(shape)
    expect(rotated).toEqual([
      [1, 1],
      [0, 1],
      [0, 1]
    ])
  })

  it('rotates a 1x1 matrix', () => {
    const shape = [[1]]
    expect(rotate90(shape)).toEqual([[1]])
  })

  it('rotates L-shape correctly', () => {
    const shape = [
      [1, 0],
      [1, 0],
      [1, 1]
    ]
    const rotated = rotate90(shape)
    expect(rotated).toEqual([
      [1, 1, 1],
      [1, 0, 0]
    ])
  })
})

describe('countCells', () => {
  it('counts filled cells', () => {
    const shape = [[1, 0], [1, 1]]
    expect(countCells(shape)).toBe(3)
  })
})

describe('canPlacePiece', () => {
  it('returns true when position is valid', () => {
    const piece = { shape: [[1, 1]] }
    const pool = [[1, 1, 1], [1, 1, 1]]
    const occupied = new Set()
    
    expect(canPlacePiece(piece, 0, 0, pool, occupied)).toBe(true)
  })

  it('returns false when out of bounds', () => {
    const piece = { shape: [[1, 1]] }
    const pool = [[1, 1]]
    const occupied = new Set()
    
    expect(canPlacePiece(piece, 1, 0, pool, occupied)).toBe(false)
  })

  it('returns false when hitting void cell', () => {
    const piece = { shape: [[1, 1]] }
    const pool = [[1, 0]]
    const occupied = new Set()
    
    expect(canPlacePiece(piece, 0, 0, pool, occupied)).toBe(false)
  })

  it('returns false when cell already occupied', () => {
    const piece = { shape: [[1]] }
    const pool = [[1]]
    const occupied = new Set(['0,0'])
    
    expect(canPlacePiece(piece, 0, 0, pool, occupied)).toBe(false)
  })
})

describe('getPieceCells', () => {
  it('returns all filled cells with positions', () => {
    const piece = { shape: [[1, 1], [0, 1]] }
    const cells = getPieceCells(piece, 2, 3)
    
    expect(cells).toContainEqual({ x: 2, y: 3 })
    expect(cells).toContainEqual({ x: 3, y: 3 })
    expect(cells).toContainEqual({ x: 3, y: 4 })
    expect(cells.length).toBe(3)
  })
})
```

Run: `npm install -D vitest`
Expected: vitest installed

- [ ] **Step 3: Run tests**

Run: `npx vitest run tests/utils/gridUtils.test.js`
Expected: All tests PASS

- [ ] **Step 4: Commit**

```bash
git add src/utils/gridUtils.js tests/utils/gridUtils.test.js
git commit -m "feat: add grid utility functions with tests"
```

---

## Task 3: Level Data and Composables

**Files:**
- Create: `src/data/levels.json`
- Create: `src/composables/useLevels.js`
- Create: `src/composables/useGameState.js`
- Create: `src/composables/useDragDrop.js`

- [ ] **Step 1: Create levels.json with sample levels**

```json
[
  {
    "id": 1,
    "name": "First Steps",
    "pool": [
      [1, 1],
      [1, 1]
    ],
    "pieces": [
      { "id": 1, "shape": [[1, 1]] },
      { "id": 2, "shape": [[1], [1]] }
    ]
  },
  {
    "id": 2,
    "name": "L-Shape",
    "pool": [
      [1, 0],
      [1, 1]
    ],
    "pieces": [
      { "id": 1, "shape": [[1], [1]] },
      { "id": 2, "shape": [[1, 1]] }
    ]
  },
  {
    "id": 3,
    "name": "T-Pool",
    "pool": [
      [1, 1, 1],
      [0, 1, 0]
    ],
    "pieces": [
      { "id": 1, "shape": [[1, 1, 1]] },
      { "id": 2, "shape": [[1]] }
    ]
  },
  {
    "id": 4,
    "name": "Steps",
    "pool": [
      [1, 0, 0],
      [1, 1, 0],
      [1, 1, 1]
    ],
    "pieces": [
      { "id": 1, "shape": [[1], [1], [1]] },
      { "id": 2, "shape": [[1, 1], [1, 0]] },
      { "id": 3, "shape": [[1]] }
    ]
  },
  {
    "id": 5,
    "name": "Big L",
    "pool": [
      [1, 0, 0],
      [1, 0, 0],
      [1, 1, 1]
    ],
    "pieces": [
      { "id": 1, "shape": [[1], [1], [1]] },
      { "id": 2, "shape": [[1, 1, 1]] }
    ]
  }
]
```

- [ ] **Step 2: Create useLevels.js**

```javascript
import { ref } from 'vue'
import levelsData from '../data/levels.json'

const levels = ref(levelsData)
const STORAGE_KEY = 'block-puzzle-completed'

export function useLevels() {
  function loadLevel(id) {
    return levels.value.find(l => l.id === id) || null
  }

  function getCompletedLevels() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  function markCompleted(id) {
    const completed = getCompletedLevels()
    if (!completed.includes(id)) {
      completed.push(id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(completed))
    }
  }

  function resetProgress() {
    localStorage.removeItem(STORAGE_KEY)
  }

  return {
    levels,
    loadLevel,
    getCompletedLevels,
    markCompleted,
    resetProgress
  }
}
```

- [ ] **Step 3: Create useGameState.js**

```javascript
import { ref, computed } from 'vue'
import { canPlacePiece, getPieceCells, rotate90 } from '../utils/gridUtils.js'
import levelsData from '../data/levels.json'

export function useGameState() {
  const pool = ref([])
  const pieces = ref([])
  const occupiedCells = ref(new Set())
  const currentLevel = ref(null)

  const isComplete = computed(() => {
    if (!pool.value.length) return false
    const totalPoolCells = pool.value.flat().filter(c => c === 1).length
    return occupiedCells.value.size === totalPoolCells
  })

  function initLevel(levelData) {
    currentLevel.value = levelData.id
    pool.value = levelData.pool.map(row => [...row])
    occupiedCells.value = new Set()

    pieces.value = levelData.pieces.map(p => ({
      ...p,
      shape: p.shape.map(row => [...row]),
      originalShape: p.shape.map(row => [...row]),
      placed: false,
      poolX: null,
      poolY: null
    }))
  }

  function canPlace(pieceId, poolX, poolY) {
    const piece = pieces.value.find(p => p.id === pieceId)
    if (!piece) return false
    return canPlacePiece(piece, poolX, poolY, pool.value, occupiedCells.value)
  }

  function placePiece(pieceId, poolX, poolY) {
    const piece = pieces.value.find(p => p.id === pieceId)
    if (!piece) return false

    if (!canPlace(pieceId, poolX, poolY)) return false

    // Remove piece cells from occupied if re-placing
    removePiece(pieceId)

    // Add new cells
    const cells = getPieceCells(piece, poolX, poolY)
    cells.forEach(({ x, y }) => occupiedCells.value.add(`${x},${y}`))

    piece.placed = true
    piece.poolX = poolX
    piece.poolY = poolY

    return true
  }

  function removePiece(pieceId) {
    const piece = pieces.value.find(p => p.id === pieceId)
    if (!piece || !piece.placed) return

    const cells = getPieceCells(piece, piece.poolX, piece.poolY)
    cells.forEach(({ x, y }) => occupiedCells.value.delete(`${x},${y}`))

    piece.placed = false
    piece.poolX = null
    piece.poolY = null
  }

  function rotatePiece(pieceId) {
    const piece = pieces.value.find(p => p.id === pieceId)
    if (!piece) return

    // If placed, remove from pool first
    if (piece.placed) {
      removePiece(pieceId)
    }

    piece.shape = rotate90(piece.shape)
  }

  function resetLevel() {
    if (currentLevel.value) {
      const levelData = levelsData.find(l => l.id === currentLevel.value)
      if (levelData) initLevel(levelData)
    }
  }

  return {
    pool,
    pieces,
    occupiedCells,
    currentLevel,
    isComplete,
    initLevel,
    canPlace,
    placePiece,
    removePiece,
    rotatePiece,
    resetLevel
  }
}
```

- [ ] **Step 4: Create useDragDrop.js**

```javascript
import { ref } from 'vue'
import { rotate90 } from '../utils/gridUtils.js'

export function useDragDrop() {
  const dragging = ref(null)
  const isOverValidPosition = ref(false)

  function startDrag(piece, event, pieceRect) {
    const clientX = event.clientX ?? event.touches?.[0]?.clientX
    const clientY = event.clientY ?? event.touches?.[0]?.clientY

    // Calculate offset from pointer to piece top-left so piece stays under cursor
    const offsetX = clientX - pieceRect.left
    const offsetY = clientY - pieceRect.top

    dragging.value = {
      pieceId: piece.id,
      piece: piece,
      offsetX: offsetX,
      offsetY: offsetY,
      currentX: clientX,
      currentY: clientY,
      rotation: 0,
      rotatedShape: piece.shape.map(row => [...row])  // Clone shape for rotation
    }
  }

  function updateDrag(event) {
    if (!dragging.value) return

    const clientX = event.clientX ?? event.touches?.[0]?.clientX
    const clientY = event.clientY ?? event.touches?.[0]?.clientY

    dragging.value.currentX = clientX
    dragging.value.currentY = clientY
  }

  function endDrag() {
    const result = dragging.value ? {
      pieceId: dragging.value.pieceId,
      rotatedShape: dragging.value.rotatedShape,
      gridX: dragging.value.gridX,
      gridY: dragging.value.gridY
    } : null
    
    dragging.value = null
    isOverValidPosition.value = false
    
    return result
  }

  function rotateWhileDragging() {
    if (dragging.value) {
      // Rotate the actual shape, not just visual
      dragging.value.rotatedShape = rotate90(dragging.value.rotatedShape)
      dragging.value.rotation = (dragging.value.rotation + 90) % 360
    }
  }

  function screenToGrid(screenX, screenY, poolRect, cellSize) {
    const gridX = Math.floor((screenX - poolRect.left) / cellSize)
    const gridY = Math.floor((screenY - poolRect.top) / cellSize)
    return { gridX, gridY }
  }

  return {
    dragging,
    isOverValidPosition,
    startDrag,
    updateDrag,
    endDrag,
    rotateWhileDragging,
    screenToGrid
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add src/data/levels.json src/composables/useLevels.js src/composables/useGameState.js src/composables/useDragDrop.js
git commit -m "feat: add level data and composables"
```

---

## Task 4: Core Components

**Files:**
- Create: `src/components/Piece.vue`
- Create: `src/components/GameBoard.vue`
- Create: `src/components/PieceTray.vue`
- Create: `src/components/LevelSelector.vue`
- Create: `src/components/LevelComplete.vue`

- [ ] **Step 1: Create Piece.vue**

```vue
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
```

- [ ] **Step 2: Create PieceTray.vue**

```vue
<script setup>
import Piece from './Piece.vue'

const props = defineProps({
  pieces: { type: Array, required: true }
})

const emit = defineEmits(['startDrag', 'dragOver'])

const PIECE_COLORS = ['#4A90D9', '#5CB85C', '#D9A441', '#9B59B6', '#1ABC9C']

function getPieceColor(index) {
  return PIECE_COLORS[index % PIECE_COLORS.length]
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
        @mousedown="emit('startDrag', piece, $event)"
        @touchstart="emit('startDrag', piece, $event)"
      >
        <Piece 
          :piece="piece" 
          :color="getPieceColor(index)"
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
```

- [ ] **Step 3: Create GameBoard.vue**

```vue
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

// Use rotatedShape during drag, original shape when not
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
    // Temporarily update piece shape for placement check
    const piece = pieces.value.find(p => p.id === result.pieceId)
    if (piece) {
      const originalShape = piece.shape.map(row => [...row])
      piece.shape = result.rotatedShape
      
      if (!placePiece(result.pieceId, result.gridX, result.gridY)) {
        // Placement failed, restore original shape
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
    } else if (event.button === 2) { // Right-click
      event.preventDefault()
      rotateWhileDragging()
    }
  }
}

// Prevent context menu during drag
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
      <button class="back-btn" @click="emit('back')">← Menu</button>
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
```

- [ ] **Step 4: Create LevelComplete.vue**

```vue
<script setup>
const props = defineProps({
  levelId: { type: Number, required: true }
})

const emit = defineEmits(['next', 'replay'])
</script>

<template>
  <div class="overlay">
    <div class="modal">
      <div class="checkmark">✓</div>
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
```

- [ ] **Step 5: Create LevelSelector.vue**

```vue
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
        <span v-if="isCompleted(level.id)" class="check">✓</span>
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
```

- [ ] **Step 6: Commit**

```bash
git add src/components/
git commit -m "feat: add all game components"
```

---

## Task 5: Polish and Testing

**Files:**
- Modify: `src/components/GameBoard.vue`

- [ ] **Step 1: Add visual feedback for valid/invalid drop zones**

Add drop indicator to GameBoard.vue template:
```vue
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
```

Add CSS:
```css
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
```

- [ ] **Step 2: Update Piece.vue colors to match piece index**

Pass color from PieceTray based on piece.id:
```vue
<Piece
  :piece="piece"
  :color="getPieceColor(piece.id - 1)"
  :cell-size="40"
/>
```

- [ ] **Step 3: Run build to verify**

Run: `npm run build`
Expected: Build completes without errors

- [ ] **Step 4: Test in browser**

Run: `npm run dev` and open browser to verify:
- Level selector shows all 5 levels
- Clicking a level loads the game board
- Pool and pieces render correctly
- Drag and drop works
- R key rotates pieces
- Level completes when pool is filled
- Can navigate back to menu

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "feat: complete block puzzle game with polish"
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Project setup | package.json, vite.config.js, index.html, main.js, App.vue |
| 2 | Grid utilities | gridUtils.js, gridUtils.test.js |
| 3 | Level data & composables | levels.json, useLevels.js, useGameState.js, useDragDrop.js |
| 4 | Core components | Piece.vue, PieceTray.vue, GameBoard.vue, LevelSelector.vue, LevelComplete.vue |
| 5 | Polish & testing | Bug fixes, visual feedback, final verification |

---

## Next Steps

After implementation:
1. Add more levels by editing `src/data/levels.json`
2. Follow the validation rule: piece cells must equal pool cells
3. Consider adding sound effects, animations, or a level editor
