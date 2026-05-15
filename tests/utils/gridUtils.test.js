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
