import { ref } from 'vue'
import { rotate90 } from '../utils/gridUtils.js'

export function useDragDrop() {
  const dragging = ref(null)
  const isOverValidPosition = ref(false)

  function startDrag(piece, event, pieceRect, color) {
    const clientX = event.clientX ?? event.touches?.[0]?.clientX
    const clientY = event.clientY ?? event.touches?.[0]?.clientY

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
      const oldShape = dragging.value.rotatedShape
      const oldWidth = oldShape[0]?.length || 0
      const oldHeight = oldShape.length

      dragging.value.rotatedShape = rotate90(oldShape)
      dragging.value.rotation = (dragging.value.rotation + 90) % 360

      // Recalculate offset to keep piece under cursor
      // The cursor stays at the same screen position
      // We need new offset so: cursorX - newPieceLeft = newOffsetX
      // And: cursorY - newPieceTop = newOffsetY
      // Since cursorX = oldPieceLeft + oldOffsetX, and newPieceLeft = oldPieceLeft (same corner)
      // Then: newOffsetX = oldOffsetX, newOffsetY = oldOffsetY
      // But wait - we also need to account for the changed dimensions!
      // The offset should be proportional: offsetX/oldWidth = newOffsetX/newWidth
      const newWidth = dragging.value.rotatedShape[0]?.length || 0
      const newHeight = dragging.value.rotatedShape.length

      // Calculate relative position (0-1) then apply to new dimensions
      const relX = dragging.value.offsetX / oldWidth
      const relY = dragging.value.offsetY / oldHeight

      dragging.value.offsetX = relX * newWidth
      dragging.value.offsetY = relY * newHeight
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
