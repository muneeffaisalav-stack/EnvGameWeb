import { describe, it, expect } from 'vitest'
import { LEVELS } from '../../game/data/levels.js'
import { MISSIONS } from '../../game/data/missions.js'

const WALKABLE = new Set(['F','G','R','D'])
const VALID_CODES = new Set(['W','F','G','R','B','D'])

describe('LEVELS data', () => {
  it('has exactly 5 levels', () => {
    expect(LEVELS).toHaveLength(5)
  })

  it('each level has required fields', () => {
    for (const level of LEVELS) {
      expect(typeof level.id).toBe('number')
      expect(typeof level.name).toBe('string')
      expect(typeof level.theme).toBe('string')
      expect(typeof level.startCol).toBe('number')
      expect(typeof level.startRow).toBe('number')
      expect(Array.isArray(level.missionIds)).toBe(true)
      expect(Array.isArray(level.grid)).toBe(true)
      expect(Array.isArray(level.npcs)).toBe(true)
      expect(typeof level.dialogues).toBe('object')
    }
  })

  it('each level grid is 15 rows x 20 cols', () => {
    for (const level of LEVELS) {
      expect(level.grid).toHaveLength(15)
      for (const row of level.grid) {
        expect(row).toHaveLength(20)
      }
    }
  })

  it('all grid cells are valid tile codes', () => {
    for (const level of LEVELS) {
      for (const row of level.grid) {
        for (const cell of row) {
          expect(VALID_CODES.has(cell), `Invalid tile "${cell}" in level ${level.id}`).toBe(true)
        }
      }
    }
  })

  it('startCol/startRow is a walkable tile', () => {
    for (const level of LEVELS) {
      const tile = level.grid[level.startRow][level.startCol]
      expect(WALKABLE.has(tile), `Level ${level.id} start (${level.startCol},${level.startRow}) is "${tile}"`).toBe(true)
    }
  })

  it('each level missionId references an entry in MISSIONS', () => {
    for (const level of LEVELS) {
      for (const id of level.missionIds) {
        expect(MISSIONS[id], `Mission "${id}" not in MISSIONS`).toBeDefined()
      }
    }
  })

  it('each npc dialogueId references a dialogue in the same level', () => {
    for (const level of LEVELS) {
      for (const npc of level.npcs) {
        expect(level.dialogues[npc.dialogueId], `Dialogue "${npc.dialogueId}" missing in level ${level.id}`).toBeDefined()
      }
    }
  })

  it('Level 5 row 4 col 3 is walkable, connecting north buildings to the road', () => {
    const level5 = LEVELS.find(l => l.id === 5)
    expect(WALKABLE.has(level5.grid[4][3]), 'Level 5 (3,4) must be walkable to reach north NPCs').toBe(true)
  })

  it('Level 4 NPCs friend and friend2 are at distinct positions', () => {
    const level4 = LEVELS.find(l => l.id === 4)
    const friend  = level4.npcs.find(n => n.id === 'friend')
    const friend2 = level4.npcs.find(n => n.id === 'friend2')
    expect(friend.col === friend2.col && friend.row === friend2.row).toBe(false)
  })

  it('findItems mission target tile is adjacent to (not on) the vendor NPC position', () => {
    const level2  = LEVELS.find(l => l.id === 2)
    const vendor  = level2.npcs.find(n => n.id === 'vendor')
    const mission = MISSIONS.findItems
    const dc = Math.abs(mission.targetTileCol - vendor.col)
    const dr = Math.abs(mission.targetTileRow - vendor.row)
    const adjacent = (dc === 1 && dr === 0) || (dc === 0 && dr === 1)
    expect(adjacent, 'findItems target should be adjacent to vendor, not on the same tile').toBe(true)
  })
})
