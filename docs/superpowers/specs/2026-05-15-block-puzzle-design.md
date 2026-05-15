# Block Puzzle Game — Design Specification

## Overview

A minimalist Vue.js puzzle game where players drag Tetris-like pieces into an irregular pool shape to perfectly fill the space. All pieces are presented at once; the goal is spatial placement and problem-solving, not speed.

---

## Game Mechanics

### Core Loop

1. Player sees a pool (irregular grid) and a set of pieces (Tetris-like shapes)
2. Player drags a piece from the tray onto the pool
3. While dragging, player can rotate the piece 90° (R key or right-click)
4. Piece snaps into valid position on drop, or returns to tray if invalid
5. When all pool cells are filled, level is complete
6. Player can retry by dragging placed pieces back to the tray

### Controls

| Action | Input |
|--------|-------|
| Pick up piece | Click/touch on piece |
| Move piece | Drag while holding |
| Rotate piece | R key or right-click while dragging |
| Drop piece | Release mouse/touch |
| Return piece | Drag placed piece back to tray |

### Validity Rules

A piece placement is valid when:
- All piece cells fall within pool bounds
- All target pool cells exist (`pool[y][x] === 1`)
- All target pool cells are currently empty

### Collision Detection Algorithm

```javascript
function canPlacePiece(piece, poolX, poolY, pool, occupiedCells) {
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
```

### Screen-to-Grid Conversion

```javascript
function screenToGrid(screenX, screenY, poolRect, cellSize, poolOffset) {
  const gridX = Math.floor((screenX - poolRect.left - poolOffset.x) / cellSize)
  const gridY = Math.floor((screenY - poolRect.top - poolOffset.y) / cellSize)
  return { gridX, gridY }
}
```

### Level Validation Rule

**Developer responsibility:** A level is only solvable if:
```
sum(pieces[].shape[].flat()) === sum(pool[].flat())
```
This must be validated when authoring levels. No runtime check in v1.

---

## Visual Design

### Style

- **Minimalist geometric** — clean lines, solid colors, focus on shapes
- **Simple colors** — muted, pleasant palette

### Color Palette

| Element | Color |
|---------|-------|
| Background | `#F5F5F5` (light gray) |
| Pool cell (empty) | `#E0E0E0` (subtle gray) |
| Pool border | `#CCCCCC` |
| Piece colors | Blue `#4A90D9`, Green `#5CB85C`, Orange `#D9A441`, Purple `#9B59B6`, Teal `#1ABC9C` |
| Placed piece | Same color, slightly darker |
| Piece border | White `#FFFFFF` |
| Tray background | `#FAFAFA` |

### Layout

- Pool centered in upper portion of screen
- Piece tray at bottom, horizontal scroll if needed
- Level selector as a separate screen/modal

---

## Level Data Format

### Structure

```json
{
  "id": 1,
  "name": "Level 1",
  "pool": [
    [1, 1, 1, 0],
    [1, 1, 1, 1],
    [1, 1, 1, 0]
  ],
  "pieces": [
    { "id": 1, "shape": [[1, 0], [1, 1]] },
    { "id": 2, "shape": [[1, 1, 1]] },
    { "id": 3, "shape": [[1], [1], [1]] }
  ]
}
```

### Definitions

- **pool**: 2D array where `1` = valid cell, `0` = void/blocked
  - Uses `pool[row][col]` / `pool[y][x]` notation (row-major)
- **pieces**: Array of piece definitions
  - **id**: Unique identifier
  - **shape**: 2D array where `1` = filled cell, `0` = empty space
  - **Constraint**: Combined piece cells (`sum(shape.flat())`) must equal total pool cells
- **Coordinate system**: `pool[y][x]` — first index is row (y), second is column (x)

### Level File Location

`src/data/levels.json` — single file containing all levels as a JSON array.

### Rotation Algorithm

For 90° clockwise rotation:
```
newShape[row][col] = oldShape[oldHeight - 1 - col][row]
```

---

## Component Architecture

```
src/
├── components/
│   ├── GameBoard.vue        # Pool grid, drop zone, placement validation
│   ├── Piece.vue            # Individual draggable piece
│   ├── PieceTray.vue        # Container for unplaced pieces
│   ├── LevelComplete.vue    # Success overlay modal
│   └── LevelSelector.vue    # Level selection screen
├── composables/
│   ├── useGameState.js      # Game state, placement logic, completion check
│   ├── useDragDrop.js       # Drag & drop coordination, rotation
│   └── useLevels.js         # Level loading, completion persistence
├── data/
│   └── levels.json           # Level definitions
├── utils/
│   └── gridUtils.js         # Coordinate math, collision detection, rotation
└── App.vue                  # Root: level selector / game board
```

### Component Responsibilities

**GameBoard.vue**
- Renders pool grid based on level data
- Handles drag-over and drop events
- Highlights valid drop positions while dragging
- Detects level completion

**Piece.vue**
- Renders piece shape with colored blocks
- Handles drag start/end events
- Applies rotation transform
- Tracks placed/unplaced state

**PieceTray.vue**
- Displays all unplaced pieces in a row
- Acts as return zone for placed pieces
- Horizontal scroll if pieces overflow

**LevelComplete.vue**
- Modal overlay on successful completion
- "Next Level" and "Replay" buttons
- Marks level as completed in storage

**LevelSelector.vue**
- Grid of level buttons
- Shows completed levels with checkmark
- Click to load and play

### Composables

**Piece Interface**
```javascript
Piece {
  id: number,
  shape: number[][],    // current shape (may be rotated during drag)
  originalShape: number[][],  // never modified, for reset
  placed: boolean,
  poolX: number | null, // grid position when placed
  poolY: number | null
}
```

**DragState Interface**
```javascript
DragState {
  pieceId: number,
  piece: Piece,         // reference to piece being dragged
  offsetX: number,       // pointer offset from piece top-left
  offsetY: number,
  currentScreenX: number,
  currentScreenY: number,
  rotation: number      // current rotation (0, 90, 180, 270)
}
```

**Occupied Cells Tracking**
```javascript
// Separate tracker for placed cells (not in pool array)
occupiedCells: Set<string>  // "x,y" format strings
// Pool array (1/0) remains unchanged
// A cell is "empty" if pool[y][x] === 1 && !occupiedCells.has("x,y")
```

**useGameState.js**
```javascript
{
  currentLevel: ref<number>,
  pool: ref<number[][]>,           // immutable copy of pool shape
  pieces: ref<Piece[]>,            // all pieces with state
  occupiedCells: ref<Set<string>>, // tracks placed piece cells
  dragging: ref<DragState|null>,
  isComplete: computed<boolean>,

  placePiece(pieceId, poolX, poolY): boolean,  // returns success
  removePiece(pieceId): void,
  rotatePiece(pieceId): void,
  canPlacePiece(pieceId, poolX, poolY): boolean,
  checkCompletion(): boolean
}
```

**useDragDrop.js**
```javascript
{
  dragging: ref<DragState|null>,
  isOverValidPosition: ref<boolean>,

  startDrag(pieceId, event): void,
  updateDrag(event): void,
  endDrag(): void,
  rotateWhileDragging(): void,
  screenToGrid(screenX, screenY): { gridX, gridY } | null
}
```

**useLevels.js**
```javascript
{
  levels: ref<Level[]>,
  loadLevel(id): Level,
  getCompletedLevels(): number[],
  markCompleted(id): void
}
```

---

## Technical Stack

- **Vue 3** with Composition API (`<script setup>`)
- **Vite** for build tooling
- **No external UI libraries** — custom CSS
- **Pointer Events API** for unified mouse/touch drag handling
- **localStorage** for level completion persistence

---

## Persistence

- Key: `block-puzzle-completed`
- Value: JSON array of completed level IDs
- Updated on level completion

---

## File Structure After Implementation

```
block-puzzle-game/
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

## Sample Levels (Developer Reference)

### Level 1 — Simple Rectangle
```json
{
  "id": 1,
  "name": "First Steps",
  "pool": [[1, 1], [1, 1]],
  "pieces": [
    { "id": 1, "shape": [[1, 1]] },
    { "id": 2, "shape": [[1], [1]] }
  ]
}
```

### Level 2 — L-Shape
```json
{
  "id": 2,
  "name": "L-Shape",
  "pool": [[1, 0], [1, 1]],
  "pieces": [
    { "id": 1, "shape": [[1], [1]] },
    { "id": 2, "shape": [[1, 1]] }
  ]
}
```

### Level 3 — T-Shape Pool
```json
{
  "id": 3,
  "name": "T-Pool",
  "pool": [[1, 1, 1], [0, 1, 0]],
  "pieces": [
    { "id": 1, "shape": [[1, 1, 1]] },
    { "id": 2, "shape": [[1]] }
  ]
}
```

---

## Future Considerations (Out of Scope for v1)

- Undo/reset button
- Timer or scoring system
- Hints or piece highlighting
- Sound effects
- Mobile-specific gestures
- Level editor UI
