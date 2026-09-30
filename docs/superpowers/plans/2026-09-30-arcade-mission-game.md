# Arcade Mission Game Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a browser-based tile-grid mission game with a landing page, 5-level select screen, tile-based game world, NPC dialogue, and localStorage progress persistence.

**Architecture:** Screen state machine in `main.js` switches between HTML-rendered screens (Landing, LevelSelect) and a Canvas-rendered game world (GameScreen). Pure logic modules (TileMap, Player, NPC, MissionSystem, Persistence) are unit-tested with Vitest; rendering and UI are verified manually in the browser.

**Tech Stack:** Vanilla HTML5 Canvas, ES Modules (no bundler), Vitest for unit tests — open `index.html` directly in a browser.

**Spec:** `docs/superpowers/specs/2026-09-30-arcade-mission-game-design.md`

## Global Constraints
- No frameworks, no bundler — ES modules loaded natively via `<script type="module">`
- Canvas: 960×720px, tiles: 48×48px, grid: 20 cols × 15 rows
- Tile codes: `W`=wall, `F`=floor, `G`=grass, `R`=road, `B`=building, `D`=door
- Walkable tiles: `F`, `G`, `R`, `D` — non-walkable: `W`, `B`
- `localStorage` key: `missionGame_progress`
- Player rendered as a 36×36 blue rectangle centered on its tile
- NPCs rendered as a 36×36 red rectangle centered on their tile
- No animated sprites — colored rectangles for MVP

## Review Focus
- **Locked level clicked:** clicking a locked card on LevelSelect must not call `switchScreen` — tested in Task 10
- **All missions complete on last level:** `MissionSystem.isLevelComplete()` must return `true` without throwing after the final mission — tested in Task 5
- **Dialogue choice for already-completed mission:** selecting `completeMission` for a done mission must be a no-op — tested in Task 5
- **No localStorage on first visit:** `loadProgress()` must return default state without throwing — tested in Task 8
- **Player at grid boundary:** `tryMove` at edge must return `false` and not corrupt position — tested in Task 3

---

### Task 1: Project Scaffold + Test Setup

**Files:**
- Create: `package.json`
- Create: `vitest.config.js`
- Create: `index.html`
- Create: `style.css`
- Create: `main.js`

**Interfaces:**
- Produces: `Game` class in `main.js` with `switchScreen(name, opts?)` and `getCurrentScreen()` — used by all screens

- [ ] **Step 1: Create package.json**

```json
{
  "name": "mission-game",
  "type": "module",
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "devDependencies": {
    "vitest": "^1.6.0"
  }
}
```

- [ ] **Step 2: Install dependencies**

```bash
npm install
```

Expected: `node_modules/vitest` present, no errors.

- [ ] **Step 3: Create vitest.config.js**

```js
import { defineConfig } from 'vitest/config'
export default defineConfig({
  test: {
    environment: 'jsdom',
  },
})
```

- [ ] **Step 4: Create index.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mission Game</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div id="screen-container"></div>
  <canvas id="game-canvas" width="960" height="720"></canvas>
  <div id="dialogue-overlay"></div>
  <div id="mission-overlay"></div>
  <script type="module" src="main.js"></script>
</body>
</html>
```

- [ ] **Step 5: Create style.css**

```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  background: #1a1a2e;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  font-family: 'Courier New', monospace;
  color: #eee;
  overflow: hidden;
}

#screen-container {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

#game-canvas {
  display: none;
  max-width: 100vw;
  max-height: 100vh;
  image-rendering: pixelated;
}

#dialogue-overlay {
  position: fixed;
  inset: 0;
  display: none;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 40px;
  z-index: 20;
  background: rgba(0,0,0,0.4);
}

#mission-overlay {
  position: fixed;
  inset: 0;
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 30;
  background: rgba(0,0,0,0.6);
}

.btn {
  padding: 14px 36px;
  font-size: 18px;
  font-family: 'Courier New', monospace;
  border: 2px solid #eee;
  background: transparent;
  color: #eee;
  cursor: pointer;
  letter-spacing: 2px;
  transition: background 0.2s, color 0.2s;
}

.btn:hover { background: #eee; color: #1a1a2e; }

.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn:disabled:hover { background: transparent; color: #eee; }
```

- [ ] **Step 6: Create main.js**

```js
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
```

- [ ] **Step 7: Create stub screen files so main.js imports resolve**

Create `game/screens/LandingScreen.js` (stub):
```js
export class LandingScreen {
  constructor(game) { this._game = game }
  mount() { document.getElementById('screen-container').textContent = 'Landing' }
  unmount() { document.getElementById('screen-container').textContent = '' }
}
```

Create `game/screens/LevelSelectScreen.js` (stub):
```js
export class LevelSelectScreen {
  constructor(game) { this._game = game }
  mount() { document.getElementById('screen-container').textContent = 'LevelSelect' }
  unmount() { document.getElementById('screen-container').textContent = '' }
}
```

Create `game/screens/GameScreen.js` (stub):
```js
export class GameScreen {
  constructor(game, canvas, levelId) {}
  mount() {}
  unmount() {}
}
```

- [ ] **Step 8: Open index.html in browser**

Open `index.html` in a browser (Chrome/Firefox). Expected: dark background, text "Landing" visible, no console errors.

- [ ] **Step 9: Commit**

```bash
git add package.json vitest.config.js index.html style.css main.js game/screens/LandingScreen.js game/screens/LevelSelectScreen.js game/screens/GameScreen.js
git commit -m "feat: project scaffold with screen state machine and test setup"
```

---

### Task 2: TileMap System

**Files:**
- Create: `game/systems/TileMap.js`
- Create: `tests/systems/TileMap.test.js`

**Interfaces:**
- Produces:
  - `new TileMap(grid)` — grid is `string[][]` (rows × cols)
  - `tileMap.isWalkable(col, row)` → `boolean`
  - `tileMap.getTile(col, row)` → `string | null`
  - `tileMap.render(ctx, cameraX, cameraY)` → `void`
  - `tileMap.cols` → `number`
  - `tileMap.rows` → `number`
  - `TileMap.TILE_SIZE` = `48`

- [ ] **Step 1: Write failing tests**

Create `tests/systems/TileMap.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { TileMap } from '../../game/systems/TileMap.js'

const GRID = [
  ['W', 'F', 'G', 'R', 'B', 'D'],
  ['W', 'W', 'G', 'R', 'B', 'F'],
]

describe('TileMap', () => {
  it('exposes cols and rows', () => {
    const map = new TileMap(GRID)
    expect(map.cols).toBe(6)
    expect(map.rows).toBe(2)
  })

  it('returns tile code for valid position', () => {
    const map = new TileMap(GRID)
    expect(map.getTile(0, 0)).toBe('W')
    expect(map.getTile(1, 0)).toBe('F')
    expect(map.getTile(5, 1)).toBe('F')
  })

  it('returns null for out-of-bounds position', () => {
    const map = new TileMap(GRID)
    expect(map.getTile(-1, 0)).toBeNull()
    expect(map.getTile(0, -1)).toBeNull()
    expect(map.getTile(6, 0)).toBeNull()
    expect(map.getTile(0, 2)).toBeNull()
  })

  it('W and B tiles are not walkable', () => {
    const map = new TileMap(GRID)
    expect(map.isWalkable(0, 0)).toBe(false) // W
    expect(map.isWalkable(4, 0)).toBe(false) // B
  })

  it('F, G, R, D tiles are walkable', () => {
    const map = new TileMap(GRID)
    expect(map.isWalkable(1, 0)).toBe(true)  // F
    expect(map.isWalkable(2, 0)).toBe(true)  // G
    expect(map.isWalkable(3, 0)).toBe(true)  // R
    expect(map.isWalkable(5, 0)).toBe(true)  // D
  })

  it('out-of-bounds tiles are not walkable', () => {
    const map = new TileMap(GRID)
    expect(map.isWalkable(-1, 0)).toBe(false)
    expect(map.isWalkable(0, 99)).toBe(false)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test
```

Expected: FAIL — `Cannot find module '../../game/systems/TileMap.js'`

- [ ] **Step 3: Create TileMap.js**

Create `game/systems/TileMap.js`:

```js
const TILE_SIZE = 48

const TILE_DEFS = {
  W: { walkable: false, color: '#4a4a5a' },
  F: { walkable: true,  color: '#d4b896' },
  G: { walkable: true,  color: '#7ec850' },
  R: { walkable: true,  color: '#888888' },
  B: { walkable: false, color: '#6b4f2e' },
  D: { walkable: true,  color: '#c4893a' },
}

export class TileMap {
  static TILE_SIZE = TILE_SIZE

  constructor(grid) {
    this._grid = grid
    this.rows = grid.length
    this.cols = grid[0]?.length ?? 0
  }

  getTile(col, row) {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return null
    return this._grid[row][col]
  }

  isWalkable(col, row) {
    const tile = this.getTile(col, row)
    if (tile === null) return false
    return TILE_DEFS[tile]?.walkable ?? false
  }

  render(ctx, cameraX, cameraY) {
    const ts = TILE_SIZE
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const tile = this._grid[row][col]
        const def = TILE_DEFS[tile]
        if (!def) continue
        ctx.fillStyle = def.color
        ctx.fillRect(col * ts - cameraX, row * ts - cameraY, ts, ts)
        ctx.strokeStyle = 'rgba(0,0,0,0.1)'
        ctx.strokeRect(col * ts - cameraX, row * ts - cameraY, ts, ts)
      }
    }
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test
```

Expected: All 6 TileMap tests PASS.

- [ ] **Step 5: Commit**

```bash
git add game/systems/TileMap.js tests/systems/TileMap.test.js
git commit -m "feat: TileMap system with walkability and canvas rendering"
```

---

### Task 3: Player Entity

**Files:**
- Create: `game/entities/Player.js`
- Create: `tests/entities/Player.test.js`

**Interfaces:**
- Consumes: `tileMap.isWalkable(col, row)` from Task 2
- Produces:
  - `new Player(col, row)`
  - `player.tryMove(dcol, drow, tileMap)` → `boolean` (true if moved)
  - `player.getCol()` → `number`
  - `player.getRow()` → `number`
  - `player.render(ctx, cameraX, cameraY)` → `void`

- [ ] **Step 1: Write failing tests**

Create `tests/entities/Player.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { Player } from '../../game/entities/Player.js'
import { TileMap } from '../../game/systems/TileMap.js'

const GRID = [
  ['W', 'G', 'G', 'W'],
  ['W', 'G', 'G', 'W'],
  ['W', 'G', 'W', 'W'],
]

describe('Player', () => {
  it('starts at given position', () => {
    const p = new Player(1, 0)
    expect(p.getCol()).toBe(1)
    expect(p.getRow()).toBe(0)
  })

  it('moves into walkable tile and returns true', () => {
    const p = new Player(1, 0)
    const map = new TileMap(GRID)
    const moved = p.tryMove(1, 0, map)
    expect(moved).toBe(true)
    expect(p.getCol()).toBe(2)
    expect(p.getRow()).toBe(0)
  })

  it('does not move into wall tile and returns false', () => {
    const p = new Player(1, 0)
    const map = new TileMap(GRID)
    const moved = p.tryMove(-1, 0, map)
    expect(moved).toBe(false)
    expect(p.getCol()).toBe(1)
    expect(p.getRow()).toBe(0)
  })

  it('does not move out of grid bounds upward (row -1)', () => {
    const p = new Player(1, 0)
    const map = new TileMap(GRID)
    const moved = p.tryMove(0, -1, map)
    expect(moved).toBe(false)
    expect(p.getRow()).toBe(0)
  })

  it('does not move out of grid bounds leftward from col 1 into col 0 wall', () => {
    const p = new Player(1, 0)
    const map = new TileMap(GRID)
    p.tryMove(-1, 0, map) // blocked by W at col 0
    expect(p.getCol()).toBe(1)
  })

  it('moves down into walkable tile', () => {
    const p = new Player(1, 0)
    const map = new TileMap(GRID)
    const moved = p.tryMove(0, 1, map)
    expect(moved).toBe(true)
    expect(p.getRow()).toBe(1)
  })

  it('does not move into W tile below', () => {
    const p = new Player(2, 1)
    const map = new TileMap(GRID)
    const moved = p.tryMove(0, 1, map) // col 2, row 2 is W
    expect(moved).toBe(false)
    expect(p.getRow()).toBe(1)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test
```

Expected: FAIL — `Cannot find module '../../game/entities/Player.js'`

- [ ] **Step 3: Create Player.js**

Create `game/entities/Player.js`:

```js
import { TileMap } from '../systems/TileMap.js'

const SIZE = 36
const COLOR = '#3a7bd5'

export class Player {
  constructor(col, row) {
    this._col = col
    this._row = row
  }

  getCol() { return this._col }
  getRow() { return this._row }

  tryMove(dcol, drow, tileMap) {
    const nextCol = this._col + dcol
    const nextRow = this._row + drow
    if (!tileMap.isWalkable(nextCol, nextRow)) return false
    this._col = nextCol
    this._row = nextRow
    return true
  }

  render(ctx, cameraX, cameraY) {
    const ts = TileMap.TILE_SIZE
    const x = this._col * ts - cameraX + (ts - SIZE) / 2
    const y = this._row * ts - cameraY + (ts - SIZE) / 2
    ctx.fillStyle = COLOR
    ctx.fillRect(x, y, SIZE, SIZE)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(x + SIZE / 2 - 4, y + 4, 8, 8)
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test
```

Expected: All 7 Player tests PASS.

- [ ] **Step 5: Commit**

```bash
git add game/entities/Player.js tests/entities/Player.test.js
git commit -m "feat: Player entity with tile-based movement and boundary collision"
```

---

### Task 4: NPC Entity

**Files:**
- Create: `game/entities/NPC.js`
- Create: `tests/entities/NPC.test.js`

**Interfaces:**
- Consumes: `TileMap.TILE_SIZE` from Task 2
- Produces:
  - `new NPC(id, col, row, dialogueId)`
  - `npc.id` → `string`
  - `npc.dialogueId` → `string`
  - `npc.getCol()` → `number`
  - `npc.getRow()` → `number`
  - `npc.isAdjacentTo(playerCol, playerRow)` → `boolean`
  - `npc.render(ctx, cameraX, cameraY)` → `void`

- [ ] **Step 1: Write failing tests**

Create `tests/entities/NPC.test.js`:

```js
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test
```

Expected: FAIL — `Cannot find module '../../game/entities/NPC.js'`

- [ ] **Step 3: Create NPC.js**

Create `game/entities/NPC.js`:

```js
import { TileMap } from '../systems/TileMap.js'

const SIZE = 36
const COLOR = '#d94f4f'

export class NPC {
  constructor(id, col, row, dialogueId) {
    this.id = id
    this._col = col
    this._row = row
    this.dialogueId = dialogueId
  }

  getCol() { return this._col }
  getRow() { return this._row }

  isAdjacentTo(playerCol, playerRow) {
    const dc = Math.abs(playerCol - this._col)
    const dr = Math.abs(playerRow - this._row)
    return (dc === 1 && dr === 0) || (dc === 0 && dr === 1)
  }

  render(ctx, cameraX, cameraY) {
    const ts = TileMap.TILE_SIZE
    const x = this._col * ts - cameraX + (ts - SIZE) / 2
    const y = this._row * ts - cameraY + (ts - SIZE) / 2
    ctx.fillStyle = COLOR
    ctx.fillRect(x, y, SIZE, SIZE)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(x + SIZE / 2 - 4, y + 4, 8, 8)
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test
```

Expected: All 8 NPC tests PASS.

- [ ] **Step 5: Commit**

```bash
git add game/entities/NPC.js tests/entities/NPC.test.js
git commit -m "feat: NPC entity with adjacency detection"
```

---

### Task 5: Mission System

**Files:**
- Create: `game/systems/MissionSystem.js`
- Create: `tests/systems/MissionSystem.test.js`

**Interfaces:**
- Produces:
  - `new MissionSystem(missions)` — missions: ordered `Mission[]` for the level
  - `missionSystem.getActiveMission()` → `Mission | null`
  - `missionSystem.completeMission(id)` → `void` (no-op if already complete or unknown)
  - `missionSystem.isLevelComplete()` → `boolean`
  - `missionSystem.getProgress()` → `{ completed: number, total: number }`
  - `missionSystem.getCompletedIds()` → `string[]`
  - `Mission` shape: `{ id: string, title: string, description: string, objectiveType: 'talkTo'|'reachLocation'|'collectItem'|'deliverItem', targetNpcId?: string, targetTileCol?: number, targetTileRow?: number }`

- [ ] **Step 1: Write failing tests**

Create `tests/systems/MissionSystem.test.js`:

```js
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test
```

Expected: FAIL — `Cannot find module '../../game/systems/MissionSystem.js'`

- [ ] **Step 3: Create MissionSystem.js**

Create `game/systems/MissionSystem.js`:

```js
export class MissionSystem {
  constructor(missions) {
    this._missions = missions
    this._completedIds = new Set()
  }

  getActiveMission() {
    return this._missions.find(m => !this._completedIds.has(m.id)) ?? null
  }

  completeMission(id) {
    if (this._completedIds.has(id)) return
    if (!this._missions.some(m => m.id === id)) return
    this._completedIds.add(id)
  }

  isLevelComplete() {
    return this._missions.every(m => this._completedIds.has(m.id))
  }

  getProgress() {
    return { completed: this._completedIds.size, total: this._missions.length }
  }

  getCompletedIds() {
    return this._missions.map(m => m.id).filter(id => this._completedIds.has(id))
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test
```

Expected: All 9 MissionSystem tests PASS.

- [ ] **Step 5: Commit**

```bash
git add game/systems/MissionSystem.js tests/systems/MissionSystem.test.js
git commit -m "feat: MissionSystem with sequential objective tracking"
```

---

### Task 6: Dialogue System

**Files:**
- Create: `game/systems/DialogueSystem.js`
- Create: `tests/systems/DialogueSystem.test.js`

**Interfaces:**
- Consumes: `#dialogue-overlay` DOM element from Task 1
- Produces:
  - `new DialogueSystem(overlayEl)`
  - `dialogueSystem.open(dialogue, onChoice)` → `void`
  - `dialogueSystem.close()` → `void`
  - `dialogueSystem.isOpen()` → `boolean`
  - `dialogueSystem.selectChoice(index)` → `void` — calls `onChoice(choiceObj)` then closes
  - Dialogue shape: `{ npcId: string, name: string, lines: Array<{ text: string, choices: Array<{ label: string, action: string, missionId?: string }> }> }`

- [ ] **Step 1: Write failing tests**

Create `tests/systems/DialogueSystem.test.js`:

```js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DialogueSystem } from '../../game/systems/DialogueSystem.js'

const DIALOGUE = {
  npcId: 'shopkeeper',
  name: 'Shopkeeper',
  lines: [{
    text: 'Welcome! What can I get you?',
    choices: [
      { label: 'Buy Tea', action: 'completeMission', missionId: 'buyTea' },
      { label: 'Goodbye', action: 'closeDialogue' },
    ],
  }],
}

function makeOverlay() {
  const el = document.createElement('div')
  el.id = 'dialogue-overlay'
  document.body.appendChild(el)
  return el
}

beforeEach(() => {
  document.body.innerHTML = ''
})

describe('DialogueSystem', () => {
  it('is closed initially', () => {
    const ds = new DialogueSystem(makeOverlay())
    expect(ds.isOpen()).toBe(false)
  })

  it('open sets isOpen to true', () => {
    const ds = new DialogueSystem(makeOverlay())
    ds.open(DIALOGUE, vi.fn())
    expect(ds.isOpen()).toBe(true)
  })

  it('renders NPC name in overlay', () => {
    const overlay = makeOverlay()
    const ds = new DialogueSystem(overlay)
    ds.open(DIALOGUE, vi.fn())
    expect(overlay.textContent).toContain('Shopkeeper')
  })

  it('renders dialogue text in overlay', () => {
    const overlay = makeOverlay()
    const ds = new DialogueSystem(overlay)
    ds.open(DIALOGUE, vi.fn())
    expect(overlay.textContent).toContain('Welcome! What can I get you?')
  })

  it('renders two choice buttons', () => {
    const overlay = makeOverlay()
    const ds = new DialogueSystem(overlay)
    ds.open(DIALOGUE, vi.fn())
    const btns = overlay.querySelectorAll('button')
    expect(btns.length).toBe(2)
    expect(btns[0].textContent).toBe('Buy Tea')
    expect(btns[1].textContent).toBe('Goodbye')
  })

  it('selectChoice calls onChoice with the choice object', () => {
    const overlay = makeOverlay()
    const ds = new DialogueSystem(overlay)
    const onChoice = vi.fn()
    ds.open(DIALOGUE, onChoice)
    ds.selectChoice(0)
    expect(onChoice).toHaveBeenCalledWith({ label: 'Buy Tea', action: 'completeMission', missionId: 'buyTea' })
  })

  it('close sets isOpen to false', () => {
    const overlay = makeOverlay()
    const ds = new DialogueSystem(overlay)
    ds.open(DIALOGUE, vi.fn())
    ds.close()
    expect(ds.isOpen()).toBe(false)
  })

  it('close clears overlay content', () => {
    const overlay = makeOverlay()
    const ds = new DialogueSystem(overlay)
    ds.open(DIALOGUE, vi.fn())
    ds.close()
    expect(overlay.innerHTML).toBe('')
  })

  it('selectChoice with closeDialogue action does not throw', () => {
    const overlay = makeOverlay()
    const ds = new DialogueSystem(overlay)
    ds.open(DIALOGUE, vi.fn())
    expect(() => ds.selectChoice(1)).not.toThrow()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test
```

Expected: FAIL — `Cannot find module '../../game/systems/DialogueSystem.js'`

- [ ] **Step 3: Create DialogueSystem.js**

Create `game/systems/DialogueSystem.js`:

```js
export class DialogueSystem {
  constructor(overlayEl) {
    this._overlay = overlayEl
    this._open = false
    this._onChoice = null
    this._currentLine = null
  }

  isOpen() { return this._open }

  open(dialogue, onChoice) {
    this._open = true
    this._onChoice = onChoice
    this._render(dialogue.name, dialogue.lines[0])
  }

  close() {
    this._open = false
    this._onChoice = null
    this._currentLine = null
    this._overlay.innerHTML = ''
    this._overlay.style.display = 'none'
  }

  selectChoice(index) {
    if (!this._currentLine) return
    const choice = this._currentLine.choices[index]
    if (!choice) return
    const cb = this._onChoice
    this.close()
    cb?.(choice)
  }

  _render(npcName, line) {
    this._currentLine = line
    this._overlay.style.display = 'flex'
    this._overlay.innerHTML = `
      <div style="
        background:#1a1a2e; border:2px solid #eee; padding:24px 32px;
        max-width:600px; width:90%; font-family:'Courier New',monospace;
      ">
        <div style="font-size:18px;font-weight:bold;margin-bottom:12px;color:#f0c040;">
          ${npcName}
        </div>
        <div style="font-size:15px;margin-bottom:20px;color:#eee;line-height:1.5;">
          ${line.text}
        </div>
        <div style="display:flex;gap:12px;flex-wrap:wrap;">
          ${line.choices.map((c, i) =>
            `<button class="btn" data-index="${i}">${c.label}</button>`
          ).join('')}
        </div>
      </div>
    `
    this._overlay.querySelectorAll('button[data-index]').forEach(btn => {
      btn.addEventListener('click', () => this.selectChoice(Number(btn.dataset.index)))
    })
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test
```

Expected: All 9 DialogueSystem tests PASS.

- [ ] **Step 5: Commit**

```bash
git add game/systems/DialogueSystem.js tests/systems/DialogueSystem.test.js
git commit -m "feat: DialogueSystem with NPC conversation overlay and choice handling"
```

---

### Task 7: Level & Mission Data

**Files:**
- Create: `game/data/missions.js`
- Create: `game/data/levels.js`
- Create: `tests/data/levels.test.js`

**Interfaces:**
- Produces:
  - `MISSIONS`: `Record<string, Mission>` keyed by mission id
  - `LEVELS`: `LevelData[]` — 5 entries
  - `LevelData`: `{ id: number, name: string, theme: string, startCol: number, startRow: number, missionIds: string[], grid: string[][], npcs: Array<{ id, col, row, dialogueId }>, dialogues: Record<string, DialogueData> }`

- [ ] **Step 1: Write failing tests**

Create `tests/data/levels.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { LEVELS } from '../../game/data/levels.js'
import { MISSIONS } from '../../game/data/missions.js'

const WALKABLE = new Set(['F','G','R','D'])
const VALID_CODES = new Set(['W','F','G','R','B','D'])

describe('LEVELS data', () => {
  it('has exactly 5 levels', () => {
    expect(LEVELS).toHaveLength(5)
  })

  it('each level has required fields', () => {
    for (const level of LEVELS) {
      expect(typeof level.id).toBe('number')
      expect(typeof level.name).toBe('string')
      expect(typeof level.theme).toBe('string')
      expect(typeof level.startCol).toBe('number')
      expect(typeof level.startRow).toBe('number')
      expect(Array.isArray(level.missionIds)).toBe(true)
      expect(Array.isArray(level.grid)).toBe(true)
      expect(Array.isArray(level.npcs)).toBe(true)
      expect(typeof level.dialogues).toBe('object')
    }
  })

  it('each level grid is 15 rows × 20 cols', () => {
    for (const level of LEVELS) {
      expect(level.grid).toHaveLength(15)
      for (const row of level.grid) {
        expect(row).toHaveLength(20)
      }
    }
  })

  it('all grid cells are valid tile codes', () => {
    for (const level of LEVELS) {
      for (const row of level.grid) {
        for (const cell of row) {
          expect(VALID_CODES.has(cell), `Invalid tile "${cell}" in level ${level.id}`).toBe(true)
        }
      }
    }
  })

  it('startCol/startRow is a walkable tile', () => {
    for (const level of LEVELS) {
      const tile = level.grid[level.startRow][level.startCol]
      expect(WALKABLE.has(tile), `Level ${level.id} start (${level.startCol},${level.startRow}) is "${tile}"`).toBe(true)
    }
  })

  it('each level missionId references an entry in MISSIONS', () => {
    for (const level of LEVELS) {
      for (const id of level.missionIds) {
        expect(MISSIONS[id], `Mission "${id}" not in MISSIONS`).toBeDefined()
      }
    }
  })

  it('each npc dialogueId references a dialogue in the same level', () => {
    for (const level of LEVELS) {
      for (const npc of level.npcs) {
        expect(level.dialogues[npc.dialogueId], `Dialogue "${npc.dialogueId}" missing in level ${level.id}`).toBeDefined()
      }
    }
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test
```

Expected: FAIL — `Cannot find module '../../game/data/levels.js'`

- [ ] **Step 3: Create missions.js**

Create `game/data/missions.js`:

```js
export const MISSIONS = {
  // Level 1
  leaveHouse:    { id: 'leaveHouse',    title: 'Leave the House',      description: 'Step outside through the front door',         objectiveType: 'reachLocation', targetTileCol: 3, targetTileRow: 6 },
  buyTea:        { id: 'buyTea',        title: 'Buy a Cup of Tea',     description: 'Talk to the shopkeeper and order tea',         objectiveType: 'talkTo',        targetNpcId: 'shopkeeper' },
  // Level 2
  findItems:     { id: 'findItems',     title: 'Find the Market Stall',description: 'Walk to the vendor stall',                     objectiveType: 'reachLocation', targetTileCol: 13, targetTileRow: 4 },
  payVendor:     { id: 'payVendor',     title: 'Pay the Vendor',       description: 'Talk to the vendor and pay for the goods',     objectiveType: 'talkTo',        targetNpcId: 'vendor' },
  deliverGoods:  { id: 'deliverGoods',  title: 'Deliver the Goods',    description: 'Bring items to the receiver',                  objectiveType: 'talkTo',        targetNpcId: 'receiver' },
  // Level 3
  getBadge:      { id: 'getBadge',      title: 'Collect Your Badge',   description: 'Pick up your access badge from reception',     objectiveType: 'talkTo',        targetNpcId: 'receptionist' },
  attendMeeting: { id: 'attendMeeting', title: 'Attend the Meeting',   description: 'Go to the conference room on the first floor', objectiveType: 'reachLocation', targetTileCol: 15, targetTileRow: 3 },
  fileReport:    { id: 'fileReport',    title: 'File the Report',      description: 'Submit the report to your manager',            objectiveType: 'talkTo',        targetNpcId: 'manager' },
  // Level 4
  meetFriend:    { id: 'meetFriend',    title: 'Meet Your Friend',     description: 'Find your friend in the park',                 objectiveType: 'talkTo',        targetNpcId: 'friend' },
  fetchOrder:    { id: 'fetchOrder',    title: 'Fetch the Order',      description: 'Pick up the cafe order at the counter',        objectiveType: 'reachLocation', targetTileCol: 14, targetTileRow: 9 },
  solveErrand:   { id: 'solveErrand',   title: 'Return with the Order',description: 'Bring the order back to your friend',          objectiveType: 'talkTo',        targetNpcId: 'friend2' },
  // Level 5
  startChain:    { id: 'startChain',    title: 'Begin the Chain',      description: 'Talk to the courier at city hall',             objectiveType: 'talkTo',        targetNpcId: 'courier' },
  finalDelivery: { id: 'finalDelivery', title: 'Final Delivery',       description: 'Deliver the package to the recipient',         objectiveType: 'talkTo',        targetNpcId: 'recipient' },
  returnHome:    { id: 'returnHome',    title: 'Return Home',          description: 'Make your way back to the start tile',         objectiveType: 'reachLocation', targetTileCol: 2, targetTileRow: 7 },
}
```

- [ ] **Step 4: Create levels.js**

Create `game/data/levels.js`. Each grid is exactly 15 rows × 20 cols.

```js
export const LEVELS = [
  {
    id: 1, name: 'Neighborhood', theme: '#7ec850',
    startCol: 2, startRow: 3,
    missionIds: ['leaveHouse', 'buyTea'],
    grid: [
      ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
      ['W','B','B','B','B','W','W','W','W','W','W','W','W','W','B','B','B','B','B','W'],
      ['W','B','F','F','F','W','W','W','W','W','W','W','W','W','B','F','F','F','B','W'],
      ['W','B','F','F','F','W','W','W','W','W','W','W','W','W','B','F','F','F','B','W'],
      ['W','B','F','F','F','W','G','G','G','G','G','G','G','G','B','F','F','F','B','W'],
      ['W','B','B','D','B','W','G','G','G','G','G','G','G','G','B','F','D','F','B','W'],
      ['W','W','W','R','W','W','G','G','G','G','G','G','G','G','W','W','R','W','W','W'],
      ['W','W','W','R','W','G','G','G','G','G','G','G','G','G','G','G','R','G','W','W'],
      ['W','W','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','G','W','W'],
      ['W','W','W','G','W','G','G','G','G','G','G','G','G','G','G','G','G','G','W','W'],
      ['W','W','W','G','W','G','G','G','G','G','G','G','G','G','G','G','G','G','W','W'],
      ['W','W','W','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','W','W'],
      ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
      ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
      ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
    ],
    npcs: [
      { id: 'shopkeeper', col: 16, row: 3, dialogueId: 'shopkeeperDialogue' },
    ],
    dialogues: {
      shopkeeperDialogue: {
        npcId: 'shopkeeper', name: 'Shopkeeper',
        lines: [{ text: 'Welcome to my tea shop! What can I get for you?', choices: [
          { label: 'One tea please!', action: 'completeMission', missionId: 'buyTea' },
          { label: 'Just browsing',   action: 'closeDialogue' },
        ]}],
      },
    },
  },
  {
    id: 2, name: 'Market District', theme: '#e8a030',
    startCol: 2, startRow: 7,
    missionIds: ['findItems', 'payVendor', 'deliverGoods'],
    grid: [
      ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
      ['W','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','W'],
      ['W','G','B','B','B','G','G','B','B','B','G','G','B','B','B','G','G','G','G','W'],
      ['W','G','B','F','B','G','G','B','F','B','G','G','B','F','B','G','G','G','G','W'],
      ['W','G','B','F','D','G','G','B','F','D','G','G','B','F','D','G','G','G','G','W'],
      ['W','G','B','B','B','G','G','B','B','B','G','G','B','B','B','G','G','G','G','W'],
      ['W','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','W'],
      ['W','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','W'],
      ['W','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','W'],
      ['W','G','B','B','G','G','G','G','G','G','G','G','G','G','G','G','G','B','G','W'],
      ['W','G','B','F','D','G','G','G','G','G','G','G','G','G','G','G','D','F','G','W'],
      ['W','G','B','B','G','G','G','G','G','G','G','G','G','G','G','G','G','B','G','W'],
      ['W','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','W'],
      ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
      ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
    ],
    npcs: [
      { id: 'vendor',   col: 13, row: 4,  dialogueId: 'vendorDialogue' },
      { id: 'receiver', col: 16, row: 10, dialogueId: 'receiverDialogue' },
    ],
    dialogues: {
      vendorDialogue: {
        npcId: 'vendor', name: 'Market Vendor',
        lines: [{ text: 'Fresh goods! That will be 5 coins. Ready to pay?', choices: [
          { label: 'Pay 5 coins', action: 'completeMission', missionId: 'payVendor' },
          { label: 'Not yet',     action: 'closeDialogue' },
        ]}],
      },
      receiverDialogue: {
        npcId: 'receiver', name: 'Delivery Receiver',
        lines: [{ text: 'Oh, you have my goods! Thank you so much.', choices: [
          { label: 'Hand over goods', action: 'completeMission', missionId: 'deliverGoods' },
          { label: 'One moment',      action: 'closeDialogue' },
        ]}],
      },
    },
  },
  {
    id: 3, name: 'Office Building', theme: '#5080c0',
    startCol: 2, startRow: 12,
    missionIds: ['getBadge', 'attendMeeting', 'fileReport'],
    grid: [
      ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
      ['W','F','F','F','F','F','F','F','F','F','F','F','F','F','F','F','F','F','F','W'],
      ['W','F','B','B','B','B','F','F','F','F','F','F','F','B','B','B','B','B','F','W'],
      ['W','F','B','F','F','B','F','F','F','F','F','F','F','B','F','F','F','B','F','W'],
      ['W','F','B','F','F','D','F','F','F','F','F','F','F','B','F','F','F','D','F','W'],
      ['W','F','B','B','B','B','F','F','F','F','F','F','F','B','B','B','B','B','F','W'],
      ['W','F','F','F','F','F','F','F','F','F','F','F','F','F','F','F','F','F','F','W'],
      ['W','F','F','F','F','F','F','F','F','F','F','F','F','F','F','F','F','F','F','W'],
      ['W','F','B','B','B','B','B','B','F','F','F','F','F','F','F','F','F','F','F','W'],
      ['W','F','B','F','F','F','F','B','F','F','F','F','F','F','F','F','F','F','F','W'],
      ['W','F','B','F','F','F','F','D','F','F','F','F','F','F','F','B','B','B','F','W'],
      ['W','F','B','B','B','B','B','B','F','F','F','F','F','F','F','B','F','B','F','W'],
      ['W','F','F','F','F','F','F','F','F','F','F','F','F','F','F','D','F','B','F','W'],
      ['W','W','W','W','W','W','W','W','W','W','R','R','R','R','R','R','F','F','F','W'],
      ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
    ],
    npcs: [
      { id: 'receptionist', col: 16, row: 3,  dialogueId: 'receptionistDialogue' },
      { id: 'manager',      col: 15, row: 10, dialogueId: 'managerDialogue' },
    ],
    dialogues: {
      receptionistDialogue: {
        npcId: 'receptionist', name: 'Receptionist',
        lines: [{ text: 'Good morning! Here is your access badge. The conference room is upstairs.', choices: [
          { label: 'Thank you', action: 'completeMission', missionId: 'getBadge' },
        ]}],
      },
      managerDialogue: {
        npcId: 'manager', name: 'Manager',
        lines: [{ text: 'Excellent work today. Please submit your report here.', choices: [
          { label: 'Submit report',    action: 'completeMission', missionId: 'fileReport' },
          { label: 'Not finished yet', action: 'closeDialogue' },
        ]}],
      },
    },
  },
  {
    id: 4, name: 'Park & Cafe', theme: '#50b878',
    startCol: 1, startRow: 7,
    missionIds: ['meetFriend', 'fetchOrder', 'solveErrand'],
    grid: [
      ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
      ['W','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','W'],
      ['W','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','W'],
      ['W','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','W'],
      ['W','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','W'],
      ['W','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','W'],
      ['W','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','W'],
      ['W','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','W'],
      ['W','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','W'],
      ['W','G','G','G','G','G','G','G','G','G','G','G','G','G','D','F','F','B','G','W'],
      ['W','G','G','G','G','G','G','G','G','G','G','G','G','G','B','F','F','B','G','W'],
      ['W','G','G','G','G','G','G','G','G','G','G','G','G','G','B','B','B','B','G','W'],
      ['W','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','W'],
      ['W','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','W'],
      ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
    ],
    npcs: [
      { id: 'friend',  col: 9, row: 4, dialogueId: 'friendDialogue' },
      { id: 'friend2', col: 9, row: 4, dialogueId: 'friend2Dialogue' },
    ],
    dialogues: {
      friendDialogue: {
        npcId: 'friend', name: 'Your Friend',
        lines: [{ text: 'Hey! Great to see you. Could you grab my order from the cafe counter?', choices: [
          { label: 'Sure, I will get it!', action: 'completeMission', missionId: 'meetFriend' },
          { label: 'Give me a minute',     action: 'closeDialogue' },
        ]}],
      },
      friend2Dialogue: {
        npcId: 'friend2', name: 'Your Friend',
        lines: [{ text: 'Oh you got it! Thank you so much, you are the best.', choices: [
          { label: 'No problem!', action: 'completeMission', missionId: 'solveErrand' },
        ]}],
      },
    },
  },
  {
    id: 5, name: 'City Center', theme: '#c060d0',
    startCol: 2, startRow: 7,
    missionIds: ['startChain', 'finalDelivery', 'returnHome'],
    grid: [
      ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
      ['W','B','B','B','B','W','W','B','B','B','B','W','W','B','B','B','B','W','W','W'],
      ['W','B','F','F','B','W','W','B','F','F','B','W','W','B','F','F','B','W','W','W'],
      ['W','B','F','F','D','R','R','D','F','F','D','R','R','D','F','F','B','W','W','W'],
      ['W','B','B','B','B','W','W','B','B','B','B','W','W','B','B','B','B','W','W','W'],
      ['W','W','W','R','W','W','W','W','R','W','W','W','W','W','R','W','W','W','W','W'],
      ['W','W','W','R','W','W','W','W','R','W','W','W','W','W','R','W','W','W','W','W'],
      ['W','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','W'],
      ['W','W','W','R','W','W','W','W','R','W','W','W','W','W','R','W','W','W','W','W'],
      ['W','W','W','R','W','W','W','W','R','W','W','W','W','W','R','W','W','W','W','W'],
      ['W','B','B','D','B','W','W','B','D','B','B','W','W','B','D','B','B','W','W','W'],
      ['W','B','F','F','B','W','W','B','F','F','B','W','W','B','F','F','B','W','W','W'],
      ['W','B','F','F','B','W','W','B','F','F','B','W','W','B','F','F','B','W','W','W'],
      ['W','B','B','B','B','W','W','B','B','B','B','W','W','B','B','B','B','W','W','W'],
      ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
    ],
    npcs: [
      { id: 'courier',   col: 8,  row: 3, dialogueId: 'courierDialogue' },
      { id: 'recipient', col: 14, row: 3, dialogueId: 'recipientDialogue' },
    ],
    dialogues: {
      courierDialogue: {
        npcId: 'courier', name: 'City Courier',
        lines: [{ text: 'You have been selected for a special delivery! Take this package to the east building.', choices: [
          { label: 'I will do it!', action: 'completeMission', missionId: 'startChain' },
          { label: 'Tell me more',  action: 'closeDialogue' },
        ]}],
      },
      recipientDialogue: {
        npcId: 'recipient', name: 'Package Recipient',
        lines: [{ text: 'Finally! This is exactly what we needed. You have saved the day!', choices: [
          { label: 'Happy to help', action: 'completeMission', missionId: 'finalDelivery' },
        ]}],
      },
    },
  },
]
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npm test
```

Expected: All 7 level data tests PASS.

- [ ] **Step 6: Commit**

```bash
git add game/data/missions.js game/data/levels.js tests/data/levels.test.js
git commit -m "feat: level and mission data for all 5 levels"
```

---

### Task 8: Persistence (localStorage)

**Files:**
- Create: `game/systems/Persistence.js`
- Create: `tests/systems/Persistence.test.js`

**Interfaces:**
- Produces:
  - `loadProgress()` → `{ unlockedLevels: number[], completedMissions: Record<string, string[]>, starRatings: Record<string, number> }`
  - `saveProgress(progress)` → `void`
  - `markMissionComplete(levelId, missionId, progress)` → updated progress object (immutable — returns new object)
  - `markLevelComplete(levelId, progress)` → updated progress object (unlocks `levelId + 1`, max 5)
  - Storage key: `'missionGame_progress'`
  - Default state: `{ unlockedLevels: [1], completedMissions: {}, starRatings: {} }`

- [ ] **Step 1: Write failing tests**

Create `tests/systems/Persistence.test.js`:

```js
import { describe, it, expect, beforeEach } from 'vitest'
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
})

describe('saveProgress', () => {
  it('writes progress to localStorage', () => {
    const state = { unlockedLevels: [1], completedMissions: {}, starRatings: {} }
    saveProgress(state)
    expect(JSON.parse(localStorage.getItem('missionGame_progress'))).toEqual(state)
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test
```

Expected: FAIL — `Cannot find module '../../game/systems/Persistence.js'`

- [ ] **Step 3: Create Persistence.js**

Create `game/systems/Persistence.js`:

```js
const STORAGE_KEY = 'missionGame_progress'
const MAX_LEVEL = 5

const defaultProgress = () => ({ unlockedLevels: [1], completedMissions: {}, starRatings: {} })

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultProgress()
    return JSON.parse(raw)
  } catch {
    return defaultProgress()
  }
}

export function saveProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
}

export function markMissionComplete(levelId, missionId, progress) {
  const existing = progress.completedMissions[levelId] ?? []
  if (existing.includes(missionId)) return progress
  return {
    ...progress,
    completedMissions: { ...progress.completedMissions, [levelId]: [...existing, missionId] },
  }
}

export function markLevelComplete(levelId, progress) {
  const next = levelId + 1
  if (next > MAX_LEVEL || progress.unlockedLevels.includes(next)) return progress
  return { ...progress, unlockedLevels: [...progress.unlockedLevels, next] }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test
```

Expected: All 9 Persistence tests PASS.

- [ ] **Step 5: Commit**

```bash
git add game/systems/Persistence.js tests/systems/Persistence.test.js
git commit -m "feat: localStorage persistence for level unlock and mission progress"
```

---

### Task 9: Landing Screen

**Files:**
- Modify: `game/screens/LandingScreen.js` (replace stub from Task 1)

**Interfaces:**
- Consumes: `game.switchScreen(name)` from `main.js`
- Produces: `mount()` renders full landing UI, `unmount()` clears it

- [ ] **Step 1: Replace LandingScreen.js stub**

```js
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
```

- [ ] **Step 2: Verify in browser**

Open `index.html`:
- Title "MISSION GAME" renders in gold on dark gradient background
- Three buttons visible: START GAME, SETTINGS, CREDITS
- SETTINGS opens panel with sound toggle + controls reference
- CREDITS opens credits panel
- Both panels toggle correctly; only one shows at a time
- START GAME navigates to level select (or console error from unfinished Task 10 stub — that's fine)
- No unexpected console errors

- [ ] **Step 3: Commit**

```bash
git add game/screens/LandingScreen.js
git commit -m "feat: LandingScreen with settings and credits overlays"
```

---

### Task 10: Level Select Screen

**Files:**
- Modify: `game/screens/LevelSelectScreen.js` (replace stub from Task 1)
- Create: `tests/screens/LevelSelectScreen.test.js`

**Interfaces:**
- Consumes: `loadProgress()` (Task 8), `LEVELS` (Task 7), `game.switchScreen('game', { levelId })` (Task 1)
- Produces: `mount()` renders 5 level cards with lock state, `unmount()` clears them

- [ ] **Step 1: Write failing tests**

Create `tests/screens/LevelSelectScreen.test.js`:

```js
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test
```

Expected: FAIL — LevelSelectScreen still has stub that does not render `[data-level-id]` buttons.

- [ ] **Step 3: Replace LevelSelectScreen.js stub**

```js
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
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test
```

Expected: All 6 LevelSelectScreen tests PASS.

- [ ] **Step 5: Verify in browser**

Open `index.html` → START GAME:
- 5 level cards appear in a grid
- Level 1 has a colored square preview and label; levels 2–5 show lock icons
- Clicking Level 1 navigates to game (stub for now — that's fine)
- BACK button returns to Landing
- No console errors

- [ ] **Step 6: Commit**

```bash
git add game/screens/LevelSelectScreen.js tests/screens/LevelSelectScreen.test.js
git commit -m "feat: LevelSelectScreen with 5 level cards and lock/unlock display"
```

---

### Task 11: Game Screen (Game Loop + HUD + Input + Mission Wiring)

**Files:**
- Modify: `game/screens/GameScreen.js` (replace stub from Task 1)

**Interfaces:**
- Consumes: `TileMap` (Task 2), `Player` (Task 3), `NPC` (Task 4), `MissionSystem` (Task 5), `DialogueSystem` (Task 6), `LEVELS`/`MISSIONS` (Task 7), `loadProgress`/`saveProgress`/`markMissionComplete`/`markLevelComplete` (Task 8), `game.switchScreen` (Task 1)
- Produces: `mount()` starts game loop, wires keyboard input; `unmount()` tears down all of the above

- [ ] **Step 1: Run all tests before changing GameScreen**

```bash
npm test
```

Expected: All existing tests still PASS (baseline before editing).

- [ ] **Step 2: Replace GameScreen.js stub**

```js
import { TileMap } from '../systems/TileMap.js'
import { MissionSystem } from '../systems/MissionSystem.js'
import { DialogueSystem } from '../systems/DialogueSystem.js'
import { Player } from '../entities/Player.js'
import { NPC } from '../entities/NPC.js'
import { LEVELS } from '../data/levels.js'
import { MISSIONS } from '../data/missions.js'
import { loadProgress, saveProgress, markMissionComplete, markLevelComplete } from '../systems/Persistence.js'

const TS = TileMap.TILE_SIZE
const CANVAS_W = 960
const CANVAS_H = 720

export class GameScreen {
  constructor(game, canvas, levelId) {
    this._game = game
    this._canvas = canvas
    this._ctx = canvas.getContext('2d')
    this._levelData = LEVELS.find(l => l.id === levelId)
    this._rafId = null
    this._keyHandler = null
    this._missionStartTime = null

    const ld = this._levelData
    this._tileMap    = new TileMap(ld.grid)
    this._player     = new Player(ld.startCol, ld.startRow)
    this._npcs       = ld.npcs.map(n => new NPC(n.id, n.col, n.row, n.dialogueId))
    this._missions   = ld.missionIds.map(id => MISSIONS[id])
    this._missionSys = new MissionSystem(this._missions)
    this._dialogue   = new DialogueSystem(document.getElementById('dialogue-overlay'))
    this._mOverlay   = document.getElementById('mission-overlay')
    this._adjacentNpc      = null
    this._showPrompt       = false
  }

  mount() {
    this._canvas.style.display = 'block'
    document.getElementById('screen-container').innerHTML = ''
    this._missionStartTime = Date.now()

    this._keyHandler = e => this._handleKey(e)
    window.addEventListener('keydown', this._keyHandler)
    this._loop()
  }

  unmount() {
    if (this._rafId) cancelAnimationFrame(this._rafId)
    this._rafId = null
    window.removeEventListener('keydown', this._keyHandler)
    this._canvas.style.display = 'none'
    this._dialogue.close()
    this._mOverlay.innerHTML = ''
    this._mOverlay.style.display = 'none'
  }

  _handleKey(e) {
    if (this._dialogue.isOpen()) return
    const moves = {
      ArrowUp:[0,-1], ArrowDown:[0,1], ArrowLeft:[-1,0], ArrowRight:[1,0],
      KeyW:[0,-1],    KeyS:[0,1],      KeyA:[-1,0],       KeyD:[1,0],
    }
    if (moves[e.code]) {
      e.preventDefault()
      const [dc, dr] = moves[e.code]
      this._player.tryMove(dc, dr, this._tileMap)
      this._checkReachLocation()
    }
    if ((e.code === 'Space' || e.code === 'Enter') && this._adjacentNpc) {
      e.preventDefault()
      this._openDialogue(this._adjacentNpc)
    }
  }

  _checkReachLocation() {
    const mission = this._missionSys.getActiveMission()
    if (!mission || mission.objectiveType !== 'reachLocation') return
    if (this._player.getCol() === mission.targetTileCol &&
        this._player.getRow() === mission.targetTileRow) {
      this._completeMission(mission.id)
    }
  }

  _openDialogue(npc) {
    const data = this._levelData.dialogues[npc.dialogueId]
    if (!data) return
    this._dialogue.open(data, choice => this._handleChoice(choice))
  }

  _handleChoice(choice) {
    if (choice.action === 'completeMission' && choice.missionId) {
      const active = this._missionSys.getActiveMission()
      if (active?.id === choice.missionId) this._completeMission(choice.missionId)
    }
  }

  _completeMission(missionId) {
    this._missionSys.completeMission(missionId)
    const elapsed = Math.round((Date.now() - this._missionStartTime) / 1000)
    this._missionStartTime = Date.now()

    let progress = loadProgress()
    progress = markMissionComplete(this._levelData.id, missionId, progress)

    const levelDone = this._missionSys.isLevelComplete()
    if (levelDone) progress = markLevelComplete(this._levelData.id, progress)
    saveProgress(progress)

    this._showMissionComplete(missionId, elapsed, levelDone)
  }

  _showMissionComplete(missionId, elapsedSeconds, isLevelComplete) {
    const mission = this._missions.find(m => m.id === missionId)
    const overlay = this._mOverlay
    overlay.style.display = 'flex'
    overlay.innerHTML = `
      <div style="background:#1a1a2e;border:2px solid #f0c040;padding:40px 48px;
                  text-align:center;font-family:'Courier New',monospace;min-width:340px;">
        <div style="font-size:48px;margin-bottom:8px;">✓</div>
        <div style="color:#f0c040;font-size:20px;letter-spacing:3px;margin-bottom:8px;">
          MISSION COMPLETE
        </div>
        <div style="color:#eee;font-size:16px;margin-bottom:4px;">${mission?.title ?? missionId}</div>
        <div style="color:#888;font-size:13px;margin-bottom:28px;">Time: ${elapsedSeconds}s</div>
        ${isLevelComplete
          ? `<button class="btn" id="ov-map" style="width:100%;">← BACK TO MAP</button>`
          : `<button class="btn" id="ov-next" style="width:100%;">NEXT MISSION →</button>`}
      </div>
    `
    if (isLevelComplete) {
      overlay.querySelector('#ov-map').addEventListener('click', () => {
        this._game.switchScreen('levelSelect')
      })
    } else {
      overlay.querySelector('#ov-next').addEventListener('click', () => {
        overlay.style.display = 'none'
        overlay.innerHTML = ''
      })
    }
  }

  _getCamera() {
    const cx = this._player.getCol() * TS - CANVAS_W / 2 + TS / 2
    const cy = this._player.getRow() * TS - CANVAS_H / 2 + TS / 2
    const maxX = this._tileMap.cols * TS - CANVAS_W
    const maxY = this._tileMap.rows * TS - CANVAS_H
    return { x: Math.max(0, Math.min(cx, maxX)), y: Math.max(0, Math.min(cy, maxY)) }
  }

  _loop() {
    this._update()
    this._draw()
    this._rafId = requestAnimationFrame(() => this._loop())
  }

  _update() {
    const pc = this._player.getCol()
    const pr = this._player.getRow()
    this._adjacentNpc = this._npcs.find(npc => npc.isAdjacentTo(pc, pr)) ?? null
    this._showPrompt  = !!this._adjacentNpc && !this._dialogue.isOpen()
  }

  _draw() {
    const ctx = this._ctx
    const cam = this._getCamera()
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H)
    this._tileMap.render(ctx, cam.x, cam.y)
    this._npcs.forEach(npc => npc.render(ctx, cam.x, cam.y))
    this._player.render(ctx, cam.x, cam.y)
    this._drawHUD(ctx)
    if (this._showPrompt && this._adjacentNpc) this._drawPrompt(ctx, cam)
  }

  _drawHUD(ctx) {
    const mission = this._missionSys.getActiveMission()
    const { completed, total } = this._missionSys.getProgress()
    ctx.fillStyle = 'rgba(0,0,0,0.72)'
    ctx.fillRect(0, 0, CANVAS_W, 40)
    ctx.font = 'bold 16px Courier New'
    ctx.fillStyle = '#f0c040'
    ctx.textAlign = 'left'
    ctx.fillText(this._levelData.name.toUpperCase(), 12, 26)
    ctx.textAlign = 'right'
    ctx.fillText(`MISSIONS: ${completed}/${total}`, CANVAS_W - 12, 26)
    if (mission) {
      ctx.fillStyle = 'rgba(0,0,0,0.72)'
      ctx.fillRect(0, CANVAS_H - 40, CANVAS_W, 40)
      ctx.fillStyle = '#eee'
      ctx.font = '14px Courier New'
      ctx.textAlign = 'left'
      ctx.fillText(`▶ ${mission.description}`, 12, CANVAS_H - 14)
    }
  }

  _drawPrompt(ctx, cam) {
    const npc = this._adjacentNpc
    const x = npc.getCol() * TS - cam.x + TS / 2
    const y = npc.getRow() * TS - cam.y - 12
    ctx.fillStyle = '#f0c040'
    ctx.font = 'bold 12px Courier New'
    ctx.textAlign = 'center'
    ctx.fillText('[SPACE] Talk', x, y)
  }
}
```

- [ ] **Step 3: Run all tests to confirm nothing broken**

```bash
npm test
```

Expected: All tests still PASS (GameScreen logic is verified manually).

- [ ] **Step 4: Full end-to-end manual verification**

Open `index.html` in browser. Walk through this checklist:

1. Landing page renders with gold title and three buttons
2. START GAME → Level Select shows 5 cards; only Level 1 is unlocked
3. Click Level 1 → canvas appears with tile grid (green grass, gray road, dark walls)
4. Blue player square at starting position; red NPC square for shopkeeper visible
5. HUD: "NEIGHBORHOOD" top-left, "MISSIONS: 0/2" top-right; bottom bar shows mission description
6. WASD/arrows move player tile-by-tile; walls block movement
7. Walk adjacent to shopkeeper → "[SPACE] Talk" prompt appears above NPC
8. Press Space → dialogue panel appears with NPC name and choice buttons
9. Click "One tea please!" → dialogue closes, Mission Complete overlay appears
10. "NEXT MISSION →" closes overlay, bottom bar updates to next mission
11. Walk to door tile (col 3, row 5) → Mission Complete for "leaveHouse" does NOT fire — missions are sequential; must complete buyTea first (this confirms ordering)
12. After completing both missions → "BACK TO MAP" appears
13. Level Select now shows Level 2 unlocked
14. Refresh page → Level 2 remains unlocked (localStorage persistence)

- [ ] **Step 5: Commit**

```bash
git add game/screens/GameScreen.js
git commit -m "feat: GameScreen with game loop, HUD, input, NPC dialogue, and mission completion"
```

---

## Self-Review

**Spec coverage:**
- ✅ Landing page: Start Game, Settings (sound toggle + controls), Credits — Task 9
- ✅ 5 levels with lock/unlock — Tasks 7, 10
- ✅ Tile grid 20×15 at 48px — Tasks 2, 7
- ✅ Arrow + WASD movement, tile-by-tile — Task 11
- ✅ Collision checked on every move — Task 3
- ✅ Camera centers on player — Task 11 (`_getCamera`)
- ✅ NPC adjacency + [SPACE] Talk prompt — Tasks 4, 11
- ✅ Dialogue overlay with NPC name, text, choices — Task 6
- ✅ `talkTo` mission completion via dialogue choice — Tasks 5, 11
- ✅ `reachLocation` mission completion on tile step — Task 11
- ✅ Sequential missions (next activates only after previous complete) — Task 5
- ✅ Mission Complete overlay with time elapsed — Task 11
- ✅ Level unlock on level complete, saved immediately — Tasks 8, 11
- ✅ localStorage persistence with default state on first load — Task 8
- ✅ `missionGame_progress` storage key — Task 8

**Placeholder scan:** No TBDs, TODOs, or "implement later" found.

**Type consistency:**
- `TileMap.TILE_SIZE = 48` → used as `TS` in GameScreen ✅
- `npc.isAdjacentTo(pc, pr)` — matches NPC.js signature ✅
- `dialogueSystem.open(dialogue, onChoice)` — signature consistent Tasks 6 and 11 ✅
- `missionSystem.getActiveMission()` returns `Mission | null` — used with optional chaining throughout ✅
- `markMissionComplete(levelId, missionId, progress)` / `markLevelComplete(levelId, progress)` — signatures match tests and usage in Task 11 ✅
- `LEVELS[i].missionIds` → `MISSIONS[id]` lookup — validated in Task 7 tests ✅

**Review Focus tests confirmed present:**
- Locked level click does not call switchScreen → Task 10 test: "clicking locked level does not call switchScreen" ✅
- `isLevelComplete()` true after last mission → Task 5 test: "isLevelComplete returns true when all missions done" ✅
- Duplicate `completeMission` is no-op → Task 5 test: "completing already-completed mission is a no-op" ✅
- `loadProgress()` with no localStorage → Task 8 test: "returns default state when no localStorage entry exists" ✅
- `tryMove` at grid boundary → Task 3 test: "does not move out of grid bounds upward (row -1)" ✅
