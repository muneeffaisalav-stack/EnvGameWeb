import { LandingScreen } from './game/screens/LandingScreen.js'
import { LevelSelectScreen } from './game/screens/LevelSelectScreen.js'
import { GameScreen } from './game/screens/GameScreen.js'

class Game {
  constructor() {
    this.container = document.getElementById('screen-container')
    this.canvas = document.getElementById('game-canvas')
    this.currentScreen = null
    this.currentScreenName = null
    this.screens = {
      landing:     () => new LandingScreen(this),
      levelSelect: () => new LevelSelectScreen(this),
      game:  (opts) => new GameScreen(this, this.canvas, opts?.levelId ?? 1),
    }
  }

  switchScreen(name, opts = {}) {
    if (this.currentScreen) this.currentScreen.unmount()
    const factory = this.screens[name]
    if (!factory) throw new Error(`Unknown screen: ${name}`)
    this.currentScreen = factory(opts)
    this.currentScreenName = name
    this.currentScreen.mount()
  }

  getCurrentScreen() { return this.currentScreenName }
}

const game = new Game()
game.switchScreen('landing')
