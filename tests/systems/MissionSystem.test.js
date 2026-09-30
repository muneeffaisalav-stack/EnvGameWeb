import { describe, it, expect } from 'vitest'
import { MissionSystem } from '../../game/systems/MissionSystem.js'

const MISSIONS = [
  { id: 'leaveHouse',  title: 'Leave the House', description: 'Step outside', objectiveType: 'reachLocation', targetTileCol: 4, targetTileRow: 5 },
  { id: 'buyTea',      title: 'Buy Tea',          description: 'Talk to shopkeeper', objectiveType: 'talkTo', targetNpcId: 'shopkeeper' },
  { id: 'returnHome',  title: 'Return Home',      description: 'Go back inside', objectiveType: 'reachLocation', targetTileCol: 2, targetTileRow: 3 },
]

describe('MissionSystem', () => {
  it('first mission is active at start', () => {
    const ms = new MissionSystem(MISSIONS)
    expect(ms.getActiveMission()?.id).toBe('leaveHouse')
  })

  it('progress shows 0/3 at start', () => {
    const ms = new MissionSystem(MISSIONS)
    expect(ms.getProgress()).toEqual({ completed: 0, total: 3 })
  })

  it('completing first mission activates second', () => {
    const ms = new MissionSystem(MISSIONS)
    ms.completeMission('leaveHouse')
    expect(ms.getActiveMission()?.id).toBe('buyTea')
  })

  it('progress shows 1/3 after first mission', () => {
    const ms = new MissionSystem(MISSIONS)
    ms.completeMission('leaveHouse')
    expect(ms.getProgress()).toEqual({ completed: 1, total: 3 })
  })

  it('isLevelComplete returns false when missions remain', () => {
    const ms = new MissionSystem(MISSIONS)
    ms.completeMission('leaveHouse')
    expect(ms.isLevelComplete()).toBe(false)
  })

  it('isLevelComplete returns true when all missions done', () => {
    const ms = new MissionSystem(MISSIONS)
    ms.completeMission('leaveHouse')
    ms.completeMission('buyTea')
    ms.completeMission('returnHome')
    expect(ms.isLevelComplete()).toBe(true)
  })

  it('getActiveMission returns null when all missions complete', () => {
    const ms = new MissionSystem(MISSIONS)
    ms.completeMission('leaveHouse')
    ms.completeMission('buyTea')
    ms.completeMission('returnHome')
    expect(ms.getActiveMission()).toBeNull()
  })

  it('completing already-completed mission is a no-op', () => {
    const ms = new MissionSystem(MISSIONS)
    ms.completeMission('leaveHouse')
    ms.completeMission('leaveHouse') // duplicate
    expect(ms.getProgress()).toEqual({ completed: 1, total: 3 })
    expect(ms.getActiveMission()?.id).toBe('buyTea')
  })

  it('getCompletedIds returns ids in mission order', () => {
    const ms = new MissionSystem(MISSIONS)
    ms.completeMission('leaveHouse')
    ms.completeMission('buyTea')
    expect(ms.getCompletedIds()).toEqual(['leaveHouse', 'buyTea'])
  })
})
