import { describe, it, expect } from 'vitest'
import { TileMap } from '../../game/systems/TileMap.js'

const GRID = [
  ['W', 'F', 'G', 'R', 'B', 'D'],
  ['W', 'W', 'G', 'R', 'B', 'F'],
]

describe('TileMap', () => {
  it('exposes cols and rows', () => {
    const map = new TileMap(GRID)
    expect(map.cols).toBe(6)
    expect(map.rows).toBe(2)
  })

  it('returns tile code for valid position', () => {
    const map = new TileMap(GRID)
    expect(map.getTile(0, 0)).toBe('W')
    expect(map.getTile(1, 0)).toBe('F')
    expect(map.getTile(5, 1)).toBe('F')
  })

  it('returns null for out-of-bounds position', () => {
    const map = new TileMap(GRID)
    expect(map.getTile(-1, 0)).toBeNull()
    expect(map.getTile(0, -1)).toBeNull()
    expect(map.getTile(6, 0)).toBeNull()
    expect(map.getTile(0, 2)).toBeNull()
  })

  it('W and B tiles are not walkable', () => {
    const map = new TileMap(GRID)
    expect(map.isWalkable(0, 0)).toBe(false) // W
    expect(map.isWalkable(4, 0)).toBe(false) // B
  })

  it('F, G, R, D tiles are walkable', () => {
    const map = new TileMap(GRID)
    expect(map.isWalkable(1, 0)).toBe(true)  // F
    expect(map.isWalkable(2, 0)).toBe(true)  // G
    expect(map.isWalkable(3, 0)).toBe(true)  // R
    expect(map.isWalkable(5, 0)).toBe(true)  // D
  })

  it('out-of-bounds tiles are not walkable', () => {
    const map = new TileMap(GRID)
    expect(map.isWalkable(-1, 0)).toBe(false)
    expect(map.isWalkable(0, 99)).toBe(false)
  })
})
