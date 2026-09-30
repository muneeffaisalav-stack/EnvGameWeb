export class LevelSelectScreen {
  constructor(game) { this._game = game }
  mount() { document.getElementById('screen-container').textContent = 'LevelSelect' }
  unmount() { document.getElementById('screen-container').textContent = '' }
}
