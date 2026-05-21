import { ref } from 'vue'
import { rotate90 } from '../utils/gridUtils.js'

// Get the actual shape bounds, ignoring padding zeros
export function getShapeBounds(shape) {
  let minRow = shape.length, maxRow = -1
  let minCol = shape[0]?.length || 0, maxCol = -1

  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c] === 1) {
        minRow = Math.min(minRow, r)
        maxRow = Math.max(maxRow, r)
        minCol = Math.min(minCol, c)
        maxCol = Math.max(maxCol, c)
      }
    }
  }

  const rows = maxRow >= 0 ? maxRow - minRow + 1 : 0
  const cols = maxCol >= 0 ? maxCol - minCol + 1 : 0
  return { rows, cols }
}

export function useDragDrop() {
  const dragging = ref(null)
  const isOverValidPosition = ref(false)

  function startDrag(piece, event, pieceRect, color) {
    const clientX = event.clientX ?? event.touches?.[0]?.clientX
    const clientY = event.clientY ?? event.touches?.[0]?.clientY

    // Calculate piece dimensions based on actual shape (ignoring padding zeros)
    const cellSize = 40
    const cellGap = 2
    const { rows, cols } = getShapeBounds(piece.shape)
    const pieceWidth = cols * cellSize + (cols - 1) * cellGap
    const pieceHeight = rows * cellSize + (rows - 1) * cellGap

    // Center offset: piece center is at mouse position
    const offsetX = pieceWidth / 2
    const offsetY = pieceHeight / 2

    dragging.value = {
      pieceId: piece.id,
      piece: piece,
      offsetX: offsetX,
      offsetY: offsetY,
      currentX: clientX,
      currentY: clientY,
      rotation: 0,
      rotatedShape: piece.shape.map(row => [...row]),
      color: color
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
      const newShape = rotate90(dragging.value.rotatedShape)
      // Create new shape array reference for Vue reactivity
      dragging.value.rotatedShape = newShape.map(row => [...row])
      dragging.value.rotation = (dragging.value.rotation + 90) % 360

      // Recalculate offset to keep piece centered after rotation
      const { rows: newHeight, cols: newWidth } = getShapeBounds(newShape)
      const cellSize = 40
      const cellGap = 2
      const pieceWidth = newWidth * cellSize + (newWidth - 1) * cellGap
      const pieceHeight = newHeight * cellSize + (newHeight - 1) * cellGap
      dragging.value.offsetX = pieceWidth / 2
      dragging.value.offsetY = pieceHeight / 2
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
    screenToGrid,
    getShapeBounds
  }
}
