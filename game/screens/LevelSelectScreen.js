import { LEVELS } from '../data/levels.js'
import { loadProgress } from '../systems/Persistence.js'

export class LevelSelectScreen {
  constructor(game) {
    this._game = game
    this._el = null
  }

  mount() {
    document.getElementById('game-canvas').style.display = 'none'
    const progress = loadProgress()
    const container = document.getElementById('screen-container')

    this._el = document.createElement('div')
    this._el.style.cssText = `
      display:flex; flex-direction:column; align-items:center; justify-content:center;
      width:100vw; height:100vh;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      gap:32px;
    `
    this._el.innerHTML = `
      <h2 style="font-size:clamp(24px,4vw,42px);letter-spacing:6px;color:#f0c040;
                 font-family:'Courier New',monospace;">SELECT LEVEL</h2>
      <div style="display:flex;flex-wrap:wrap;gap:20px;justify-content:center;
                  max-width:900px;padding:0 20px;">
        ${LEVELS.map(level => {
          const unlocked = progress.unlockedLevels.includes(level.id)
          return `
            <button
              class="btn"
              data-level-id="${level.id}"
              ${unlocked ? '' : 'disabled'}
              style="width:150px;height:150px;display:flex;flex-direction:column;
                     align-items:center;justify-content:center;gap:8px;
                     border-color:${unlocked ? level.theme : '#444'};"
            >
              <div style="width:56px;height:56px;
                          background:${unlocked ? level.theme : '#333'};
                          border:2px solid ${unlocked ? level.theme : '#555'};"></div>
              <span style="font-size:11px;letter-spacing:1px;">${level.name.toUpperCase()}</span>
              <span style="font-size:20px;">${unlocked ? '' : '🔒'}</span>
            </button>
          `
        }).join('')}
      </div>
      <button class="btn" id="btn-back">← BACK</button>
    `
    container.appendChild(this._el)

    LEVELS.forEach(level => {
      const card = this._el.querySelector(`[data-level-id="${level.id}"]`)
      if (!card || card.disabled) return
      card.addEventListener('click', () => this._game.switchScreen('game', { levelId: level.id }))
    })

    this._el.querySelector('#btn-back').addEventListener('click', () => {
      this._game.switchScreen('landing')
    })
  }

  unmount() {
    this._el?.remove()
    this._el = null
  }
}
