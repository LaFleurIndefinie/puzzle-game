import { ref, computed } from 'vue'
import { canPlacePiece, getPieceCells, rotate90 } from '../utils/gridUtils.js'
import levelsData from '../data/levels.json'

export function useGameState() {
  const pool = ref([])
  const pieces = ref([])
  const occupiedCells = ref(new Map()) // key: "x,y", value: color
  const currentLevel = ref(null)

  const isComplete = computed(() => {
    if (!pool.value.length) return false
    const totalPoolCells = pool.value.flat().filter(c => c === 1).length
    return occupiedCells.value.size === totalPoolCells
  })

  function initLevel(levelData) {
    currentLevel.value = levelData.id
    pool.value = levelData.pool.map(row => [...row])
    occupiedCells.value = new Map()

    pieces.value = levelData.pieces.map(p => ({
      ...p,
      shape: p.shape.map(row => [...row]),
      originalShape: p.shape.map(row => [...row]),
      placed: false,
      poolX: null,
      poolY: null,
      color: null
    }))
  }

  function canPlace(pieceId, poolX, poolY, shape) {
    const piece = pieces.value.find(p => p.id === pieceId)
    if (!piece) return false
    // Create a Set from the Map keys for compatibility
    const occupiedKeys = new Set(occupiedCells.value.keys())
    return canPlacePiece(piece, poolX, poolY, pool.value, occupiedKeys, shape)
  }

  function placePiece(pieceId, poolX, poolY, color, shape) {
    const piece = pieces.value.find(p => p.id === pieceId)
    if (!piece) return false

    if (!canPlace(pieceId, poolX, poolY, shape)) return false

    removePiece(pieceId)

    const cells = getPieceCells(piece, poolX, poolY, shape)
    cells.forEach(({ x, y }) => occupiedCells.value.set(`${x},${y}`, color))

    piece.placed = true
    piece.poolX = poolX
    piece.poolY = poolY
    piece.color = color

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
    piece.color = null
  }

  function rotatePiece(pieceId) {
    const piece = pieces.value.find(p => p.id === pieceId)
    if (!piece) return

    if (piece.placed) {
      removePiece(pieceId)
    }

    piece.shape = rotate90(piece.shape)
  }

  function getCellColor(x, y) {
    return occupiedCells.value.get(`${x},${y}`) || null
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
    getCellColor,
    resetLevel
  }
}
