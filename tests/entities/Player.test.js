import { describe, it, expect } from 'vitest'
import { Player } from '../../game/entities/Player.js'
import { TileMap } from '../../game/systems/TileMap.js'

const GRID = [
  ['W', 'G', 'G', 'W'],
  ['W', 'G', 'G', 'W'],
  ['W', 'G', 'W', 'W'],
]

describe('Player', () => {
  it('starts at given position', () => {
    const p = new Player(1, 0)
    expect(p.getCol()).toBe(1)
    expect(p.getRow()).toBe(0)
  })

  it('moves into walkable tile and returns true', () => {
    const p = new Player(1, 0)
    const map = new TileMap(GRID)
    const moved = p.tryMove(1, 0, map)
    expect(moved).toBe(true)
    expect(p.getCol()).toBe(2)
    expect(p.getRow()).toBe(0)
  })

  it('does not move into wall tile and returns false', () => {
    const p = new Player(1, 0)
    const map = new TileMap(GRID)
    const moved = p.tryMove(-1, 0, map)
    expect(moved).toBe(false)
    expect(p.getCol()).toBe(1)
    expect(p.getRow()).toBe(0)
  })

  it('does not move out of grid bounds upward (row -1)', () => {
    const p = new Player(1, 0)
    const map = new TileMap(GRID)
    const moved = p.tryMove(0, -1, map)
    expect(moved).toBe(false)
    expect(p.getRow()).toBe(0)
  })

  it('does not move out of grid bounds leftward from col 1 into col 0 wall', () => {
    const p = new Player(1, 0)
    const map = new TileMap(GRID)
    p.tryMove(-1, 0, map)
    expect(p.getCol()).toBe(1)
  })

  it('moves down into walkable tile', () => {
    const p = new Player(1, 0)
    const map = new TileMap(GRID)
    const moved = p.tryMove(0, 1, map)
    expect(moved).toBe(true)
    expect(p.getRow()).toBe(1)
  })

  it('does not move into W tile below', () => {
    const p = new Player(2, 1)
    const map = new TileMap(GRID)
    const moved = p.tryMove(0, 1, map) // col 2, row 2 is W
    expect(moved).toBe(false)
    expect(p.getRow()).toBe(1)
  })
})
