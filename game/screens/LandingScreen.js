export class LandingScreen {
  constructor(game) { this._game = game }
  mount() { document.getElementById('screen-container').textContent = 'Landing' }
  unmount() { document.getElementById('screen-container').textContent = '' }
}
