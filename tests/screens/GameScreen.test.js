import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('../../game/systems/Persistence.js', () => ({
  loadProgress:        () => ({ unlockedLevels: [1], completedMissions: {}, starRatings: {} }),
  saveProgress:        vi.fn(),
  markMissionComplete: (_, __, p) => p,
  markLevelComplete:   (_, p)    => p,
}))

vi.mock('../../game/data/levels.js', () => ({
  LEVELS: [{
    id: 1, name: 'Test', theme: '#fff',
    startCol: 2, startRow: 2,
    missionIds: ['leaveHouse', 'buyTea'],
    grid: [
      ['W','W','W','W','W'],
      ['W','F','F','F','W'],
      ['W','F','F','F','W'],
      ['W','F','F','F','W'],
      ['W','W','W','W','W'],
    ],
    npcs: [{ id: 'shopkeeper', col: 3, row: 2, dialogueId: 'shopkeeperDialogue' }],
    dialogues: {
      shopkeeperDialogue: {
        npcId: 'shopkeeper', name: 'Shopkeeper',
        lines: [{ text: 'Hello! Want some tea?', choices: [
          { label: 'Buy Tea', action: 'completeMission', missionId: 'buyTea' },
        ]}],
      },
    },
  }],
}))

vi.mock('../../game/data/missions.js', () => ({
  MISSIONS: {
    leaveHouse: { id: 'leaveHouse', objectiveType: 'reachLocation', targetTileCol: 1, targetTileRow: 3, title: 'Leave House', description: 'Go outside' },
    buyTea:     { id: 'buyTea',     objectiveType: 'talkTo',        targetNpcId: 'shopkeeper',           title: 'Buy Tea',    description: 'Talk to shopkeeper' },
  },
}))

import { GameScreen } from '../../game/screens/GameScreen.js'

function makeGame() { return { switchScreen: vi.fn() } }

function makeCanvas() {
  const c = document.createElement('canvas')
  c.width = 960; c.height = 720
  return c
}

beforeEach(() => {
  document.body.innerHTML = `
    <div id="screen-container"></div>
    <canvas id="game-canvas"></canvas>
    <div id="dialogue-overlay" style="display:none"></div>
    <div id="mission-overlay"  style="display:none"></div>
  `
  vi.stubGlobal('requestAnimationFrame', vi.fn())
})

afterEach(() => {
  vi.unstubAllGlobals()
})

function makeScreen() {
  const game = makeGame()
  const screen = new GameScreen(game, makeCanvas(), 1)
  return { screen, game }
}

describe('GameScreen — Escape key (I2)', () => {
  it('Escape key calls switchScreen with levelSelect', () => {
    const { screen, game } = makeScreen()
    screen._handleKey({ code: 'Escape', preventDefault: vi.fn() })
    expect(game.switchScreen).toHaveBeenCalledWith('levelSelect')
  })
})

describe('GameScreen — overlay blocks input (I3)', () => {
  it('movement is blocked when _missionOverlayOpen is true', () => {
    const { screen } = makeScreen()
    screen._missionOverlayOpen = true
    const col = screen._player.getCol()
    screen._handleKey({ code: 'ArrowRight', preventDefault: vi.fn() })
    expect(screen._player.getCol()).toBe(col)
  })

  it('_missionOverlayOpen is set true when mission overlay is shown', () => {
    const { screen } = makeScreen()
    screen._missionSys.completeMission('leaveHouse')
    screen._showMissionComplete('leaveHouse', 5, false)
    expect(screen._missionOverlayOpen).toBe(true)
  })
})

describe('GameScreen — not-ready dialogue (I4)', () => {
  it('shows a not-ready message when NPC is not the active mission target', () => {
    const { screen } = makeScreen()
    // Active mission is leaveHouse (reachLocation), shopkeeper is not the target
    const shopkeeper = screen._npcs[0]
    screen._openDialogue(shopkeeper)
    const overlay = document.getElementById('dialogue-overlay')
    expect(overlay.textContent).not.toContain('Hello! Want some tea?')
  })

  it('shows the full dialogue when NPC is the active talkTo target', () => {
    const { screen } = makeScreen()
    screen._missionSys.completeMission('leaveHouse')
    const shopkeeper = screen._npcs[0]
    screen._openDialogue(shopkeeper)
    const overlay = document.getElementById('dialogue-overlay')
    expect(overlay.textContent).toContain('Hello! Want some tea?')
  })
})
