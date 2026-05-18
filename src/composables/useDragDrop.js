import { ref } from 'vue'
import { rotate90 } from '../utils/gridUtils.js'

export function useDragDrop() {
  const dragging = ref(null)
  const isOverValidPosition = ref(false)

  function startDrag(piece, event, pieceRect, color) {
    const clientX = event.clientX ?? event.touches?.[0]?.clientX
    const clientY = event.clientY ?? event.touches?.[0]?.clientY

    // Calculate piece dimensions including gaps
    const cellSize = 40
    const cellGap = 2
    const rows = piece.shape.length
    const cols = piece.shape[0]?.length || 0
    const pieceWidth = cols * cellSize + (cols - 1) * cellGap
    const pieceHeight = rows * cellSize + (rows - 1) * cellGap

    // Center offset: piece center is always at mouse position
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
      dragging.value.rotatedShape = newShape
      dragging.value.rotation = (dragging.value.rotation + 90) % 360

      // Recalculate offset to keep piece centered after rotation
      const newWidth = newShape[0]?.length || 0
      const newHeight = newShape.length
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
    screenToGrid
  }
}
