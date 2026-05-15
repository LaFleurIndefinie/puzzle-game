import { ref } from 'vue'
import { rotate90 } from '../utils/gridUtils.js'

export function useDragDrop() {
  const dragging = ref(null)
  const isOverValidPosition = ref(false)

  function startDrag(piece, event, pieceRect) {
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
      rotatedShape: piece.shape.map(row => [...row])
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
