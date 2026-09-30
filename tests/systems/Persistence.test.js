import { describe, it, expect, vi, beforeEach } from 'vitest'
import { loadProgress, saveProgress, markMissionComplete, markLevelComplete } from '../../game/systems/Persistence.js'

beforeEach(() => { localStorage.clear() })

describe('loadProgress', () => {
  it('returns default state when no localStorage entry exists', () => {
    expect(loadProgress()).toEqual({ unlockedLevels: [1], completedMissions: {}, starRatings: {} })
  })

  it('returns saved state when entry exists', () => {
    const state = { unlockedLevels: [1,2], completedMissions: { 1: ['leaveHouse'] }, starRatings: { 1: 2 } }
    localStorage.setItem('missionGame_progress', JSON.stringify(state))
    expect(loadProgress()).toEqual(state)
  })

  it('returns default state when localStorage contains invalid JSON', () => {
    localStorage.setItem('missionGame_progress', 'not-valid-json')
    expect(loadProgress()).toEqual({ unlockedLevels: [1], completedMissions: {}, starRatings: {} })
  })

  it('returns default state when stored JSON parses to null', () => {
    localStorage.setItem('missionGame_progress', 'null')
    expect(loadProgress()).toEqual({ unlockedLevels: [1], completedMissions: {}, starRatings: {} })
  })

  it('returns default state when stored value lacks unlockedLevels array', () => {
    localStorage.setItem('missionGame_progress', JSON.stringify({ completedMissions: {}, starRatings: {} }))
    expect(loadProgress()).toEqual({ unlockedLevels: [1], completedMissions: {}, starRatings: {} })
  })
})

describe('saveProgress', () => {
  it('writes progress to localStorage', () => {
    const state = { unlockedLevels: [1], completedMissions: {}, starRatings: {} }
    saveProgress(state)
    expect(JSON.parse(localStorage.getItem('missionGame_progress'))).toEqual(state)
  })

  it('does not throw when localStorage.setItem fails', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => { throw new Error('QuotaExceededError') })
    expect(() => saveProgress({ unlockedLevels: [1], completedMissions: {}, starRatings: {} })).not.toThrow()
  })
})

describe('markMissionComplete', () => {
  it('adds missionId to completedMissions for the level', () => {
    const p = loadProgress()
    const updated = markMissionComplete(1, 'leaveHouse', p)
    expect(updated.completedMissions[1]).toContain('leaveHouse')
  })

  it('does not duplicate an already-completed mission', () => {
    const p = loadProgress()
    const p1 = markMissionComplete(1, 'leaveHouse', p)
    const p2 = markMissionComplete(1, 'leaveHouse', p1)
    expect(p2.completedMissions[1].filter(id => id === 'leaveHouse')).toHaveLength(1)
  })

  it('does not mutate the input progress object', () => {
    const p = loadProgress()
    markMissionComplete(1, 'leaveHouse', p)
    expect(p.completedMissions[1]).toBeUndefined()
  })
})

describe('markLevelComplete', () => {
  it('unlocks the next level', () => {
    const p = loadProgress()
    expect(markLevelComplete(1, p).unlockedLevels).toContain(2)
  })

  it('does not duplicate already-unlocked level', () => {
    const p = { unlockedLevels: [1, 2], completedMissions: {}, starRatings: {} }
    expect(markLevelComplete(1, p).unlockedLevels.filter(l => l === 2)).toHaveLength(1)
  })

  it('does not unlock level 6 after completing level 5', () => {
    expect(markLevelComplete(5, loadProgress()).unlockedLevels).not.toContain(6)
  })
})
