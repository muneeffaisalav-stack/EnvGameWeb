export class LandingScreen {
  constructor(game) {
    this._game = game
    this._el = null
  }

  mount() {
    document.getElementById('game-canvas').style.display = 'none'
    const container = document.getElementById('screen-container')

    this._el = document.createElement('div')
    this._el.style.cssText = `
      display:flex; flex-direction:column; align-items:center; justify-content:center;
      width:100vw; height:100vh;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    `
    this._el.innerHTML = `
      <h1 style="font-size:clamp(36px,6vw,72px);letter-spacing:8px;margin-bottom:12px;
                 color:#f0c040;text-shadow:0 0 30px rgba(240,192,64,0.5);
                 font-family:'Courier New',monospace;">MISSION GAME</h1>
      <p style="color:#888;letter-spacing:4px;margin-bottom:60px;font-size:14px;">
        A TILE-BASED ADVENTURE
      </p>
      <div style="display:flex;flex-direction:column;gap:16px;align-items:center;">
        <button class="btn" id="btn-start">START GAME</button>
        <button class="btn" id="btn-settings">SETTINGS</button>
        <button class="btn" id="btn-credits">CREDITS</button>
      </div>
      <div id="settings-panel" style="display:none;margin-top:32px;border:1px solid #444;
           padding:24px;min-width:280px;text-align:center;">
        <p style="margin-bottom:16px;letter-spacing:2px;color:#aaa;">SETTINGS</p>
        <label style="display:flex;align-items:center;justify-content:center;gap:12px;cursor:pointer;">
          <span>Sound</span>
          <input type="checkbox" id="sound-toggle" checked style="width:18px;height:18px;">
        </label>
        <p style="margin-top:20px;color:#666;font-size:13px;">
          WASD or Arrow Keys to move<br>Space / Enter to interact
        </p>
        <button class="btn" id="btn-close-settings" style="margin-top:20px;">CLOSE</button>
      </div>
      <div id="credits-panel" style="display:none;margin-top:32px;border:1px solid #444;
           padding:24px;min-width:280px;text-align:center;">
        <p style="letter-spacing:2px;color:#aaa;">CREDITS</p>
        <p style="margin-top:12px;color:#666;font-size:13px;">
          A browser tile adventure<br>Built with vanilla JS + Canvas
        </p>
        <button class="btn" id="btn-close-credits" style="margin-top:20px;">CLOSE</button>
      </div>
    `
    container.appendChild(this._el)

    this._el.querySelector('#btn-start').addEventListener('click', () => this._game.switchScreen('levelSelect'))
    this._el.querySelector('#btn-settings').addEventListener('click', () => {
      this._el.querySelector('#settings-panel').style.display = 'block'
      this._el.querySelector('#credits-panel').style.display = 'none'
    })
    this._el.querySelector('#btn-credits').addEventListener('click', () => {
      this._el.querySelector('#credits-panel').style.display = 'block'
      this._el.querySelector('#settings-panel').style.display = 'none'
    })
    this._el.querySelector('#btn-close-settings').addEventListener('click', () => {
      this._el.querySelector('#settings-panel').style.display = 'none'
    })
    this._el.querySelector('#btn-close-credits').addEventListener('click', () => {
      this._el.querySelector('#credits-panel').style.display = 'none'
    })
  }

  unmount() {
    this._el?.remove()
    this._el = null
  }
}
