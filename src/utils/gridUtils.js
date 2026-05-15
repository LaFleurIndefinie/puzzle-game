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
export function canPlacePiece(piece, poolX, poolY, pool, occupiedCells, shape) {
  const checkShape = shape || piece.shape
  for (let py = 0; py < checkShape.length; py++) {
    for (let px = 0; px < checkShape[py].length; px++) {
      if (checkShape[py][px] === 1) {
        const gridX = poolX + px
        const gridY = poolY + py

        // Check bounds
        if (gridY < 0 || gridY >= pool.length) return false
        if (pool.length === 0 || gridX < 0 || gridX >= pool[0].length) return false

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
export function getPieceCells(piece, poolX, poolY, shape) {
  const cells = []
  const checkShape = shape || piece.shape
  for (let py = 0; py < checkShape.length; py++) {
    for (let px = 0; px < checkShape[py].length; px++) {
      if (checkShape[py][px] === 1) {
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
