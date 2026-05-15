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

    removePiece(pieceId)

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
