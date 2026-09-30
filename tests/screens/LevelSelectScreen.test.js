import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../game/systems/Persistence.js', () => ({
  loadProgress: () => ({ unlockedLevels: [1, 2], completedMissions: {}, starRatings: {} }),
}))

vi.mock('../../game/data/levels.js', () => ({
  LEVELS: [
    { id: 1, name: 'Neighborhood',   theme: '#7ec850' },
    { id: 2, name: 'Market District',theme: '#e8a030' },
    { id: 3, name: 'Office Building',theme: '#5080c0' },
    { id: 4, name: 'Park & Cafe',    theme: '#50b878' },
    { id: 5, name: 'City Center',    theme: '#c060d0' },
  ],
}))

import { LevelSelectScreen } from '../../game/screens/LevelSelectScreen.js'

function makeGame() { return { switchScreen: vi.fn() } }

beforeEach(() => {
  document.body.innerHTML = '<div id="screen-container"></div><canvas id="game-canvas"></canvas>'
})

describe('LevelSelectScreen', () => {
  it('renders 5 level cards', () => {
    new LevelSelectScreen(makeGame()).mount()
    expect(document.querySelectorAll('[data-level-id]')).toHaveLength(5)
  })

  it('unlocked level card (id=1) is not disabled', () => {
    new LevelSelectScreen(makeGame()).mount()
    expect(document.querySelector('[data-level-id="1"]').disabled).toBe(false)
  })

  it('locked level card (id=3) is disabled', () => {
    new LevelSelectScreen(makeGame()).mount()
    expect(document.querySelector('[data-level-id="3"]').disabled).toBe(true)
  })

  it('clicking unlocked level calls switchScreen with levelId', () => {
    const game = makeGame()
    new LevelSelectScreen(game).mount()
    document.querySelector('[data-level-id="2"]').click()
    expect(game.switchScreen).toHaveBeenCalledWith('game', { levelId: 2 })
  })

  it('clicking locked level does not call switchScreen', () => {
    const game = makeGame()
    new LevelSelectScreen(game).mount()
    document.querySelector('[data-level-id="3"]').click()
    expect(game.switchScreen).not.toHaveBeenCalled()
  })

  it('unmount removes the screen element', () => {
    const screen = new LevelSelectScreen(makeGame())
    screen.mount()
    screen.unmount()
    expect(document.querySelector('[data-level-id]')).toBeNull()
  })
})
