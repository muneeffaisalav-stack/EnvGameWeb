import { describe, it, expect } from 'vitest'
import { NPC } from '../../game/entities/NPC.js'

describe('NPC', () => {
  it('exposes id, dialogueId, col, row', () => {
    const npc = new NPC('shopkeeper', 5, 3, 'shopkeeperDialogue')
    expect(npc.id).toBe('shopkeeper')
    expect(npc.dialogueId).toBe('shopkeeperDialogue')
    expect(npc.getCol()).toBe(5)
    expect(npc.getRow()).toBe(3)
  })

  it('isAdjacentTo returns true when player is directly left', () => {
    const npc = new NPC('n', 5, 3, 'd')
    expect(npc.isAdjacentTo(4, 3)).toBe(true)
  })

  it('isAdjacentTo returns true when player is directly right', () => {
    const npc = new NPC('n', 5, 3, 'd')
    expect(npc.isAdjacentTo(6, 3)).toBe(true)
  })

  it('isAdjacentTo returns true when player is directly above', () => {
    const npc = new NPC('n', 5, 3, 'd')
    expect(npc.isAdjacentTo(5, 2)).toBe(true)
  })

  it('isAdjacentTo returns true when player is directly below', () => {
    const npc = new NPC('n', 5, 3, 'd')
    expect(npc.isAdjacentTo(5, 4)).toBe(true)
  })

  it('isAdjacentTo returns false for same tile', () => {
    const npc = new NPC('n', 5, 3, 'd')
    expect(npc.isAdjacentTo(5, 3)).toBe(false)
  })

  it('isAdjacentTo returns false for diagonal', () => {
    const npc = new NPC('n', 5, 3, 'd')
    expect(npc.isAdjacentTo(4, 2)).toBe(false)
    expect(npc.isAdjacentTo(6, 4)).toBe(false)
  })

  it('isAdjacentTo returns false when two tiles away', () => {
    const npc = new NPC('n', 5, 3, 'd')
    expect(npc.isAdjacentTo(3, 3)).toBe(false)
  })
})
