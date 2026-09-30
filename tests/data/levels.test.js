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
})
