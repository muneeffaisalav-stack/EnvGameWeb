# Arcade Mission Game — Design Spec
**Date:** 2026-09-30  
**Stack:** Vanilla HTML5 Canvas + JavaScript (ES Modules)  
**Scope:** 5 levels, 2–3 missions each, tile-based grid world, NPC dialogue

---

## 1. Overview

A browser-based top-down tile-grid adventure game where the player navigates between locations and completes real-world-style missions by interacting with NPCs. The game opens on a landing page, lets the player select a level, then drops them into a tile-based world to explore and complete objectives.

**Success criteria:**
- Landing page loads instantly with Start Game, Settings, Credits
- 5 levels selectable from a level-select screen (with lock/unlock progression)
- Player navigates a tile grid using keyboard, interacts with NPCs via Space/Enter
- NPC dialogue advances mission objectives
- Progress persists via `localStorage`

---

## 2. Architecture

### Screen State Machine
```
Landing → LevelSelect → GameWorld → MissionComplete → LevelSelect
              ↑                ↕
              └──── Settings Overlay (from any screen)
```

`main.js` owns the state machine. Each screen is a class with `mount()` and `unmount()` methods. Switching screens calls `unmount()` on the current screen and `mount()` on the next.

### File Structure
```
playG/
├── index.html
├── style.css
├── main.js                          # Bootstrap + screen state machine
├── game/
│   ├── screens/
│   │   ├── LandingScreen.js         # Start, Settings, Credits
│   │   ├── LevelSelectScreen.js     # 5 level cards, lock state
│   │   └── GameScreen.js            # Game loop, canvas, player, HUD
│   ├── entities/
│   │   ├── Player.js                # Position, movement, collision
│   │   └── NPC.js                   # Dialogue trigger, interaction zone
│   ├── systems/
│   │   ├── MissionSystem.js         # Objective state, completion logic
│   │   ├── DialogueSystem.js        # NPC conversation UI overlay
│   │   └── TileMap.js               # Grid rendering, tile types, walkability
│   └── data/
│       ├── levels.js                # 5 level definitions
│       └── missions.js              # Mission objectives per level
└── assets/
    ├── tiles/                       # Tile images (48×48px)
    └── sprites/                     # Player + NPC sprites
```

---

## 3. Game World

### Canvas & Grid
- Canvas size: **960×720px** (responsive scaling via CSS)
- Grid: **20 columns × 15 rows**, each tile **48×48px**
- Camera centers on player for maps larger than the canvas

### Tile Types
| Type | Walkable | Description |
|------|----------|-------------|
| `floor` | Yes | Indoor floor |
| `grass` | Yes | Outdoor ground |
| `road` | Yes | Street tiles |
| `wall` | No | Building walls |
| `building` | No | Solid structure |
| `door` | Yes | Entry point, triggers scene transition |

### Player Movement
- Arrow keys or WASD, tile-by-tile movement
- Collision checked against tile walkability before each move
- Movement speed: one tile per keypress (no physics, no sliding)

---

## 4. Levels & Missions

### Level Progression
- Level 1 unlocked by default
- Level N unlocks after all missions in Level N-1 are complete
- Lock/unlock state persisted in `localStorage`

### Levels
| # | Setting | Missions |
|---|---------|----------|
| 1 | **Neighborhood** | 1. Leave house → 2. Buy tea from shopkeeper |
| 2 | **Market District** | 1. Find 3 items → 2. Pay vendor → 3. Deliver to NPC |
| 3 | **Office Building** | 1. Collect access badge → 2. Attend meeting → 3. File report |
| 4 | **Park & Cafe** | 1. Meet friend at park → 2. Fetch their order → 3. Solve errand |
| 5 | **City Center** | 1. Multi-location chain mission → 2. Final delivery → 3. Return home |

### Mission Structure
- Missions within a level are **sequential** — complete #1 before #2 activates
- Each mission has: `id`, `title`, `description`, `objectiveType`, `targetNpcId` / `targetTileId`, `completionTrigger`
- `objectiveType` values: `talkTo`, `deliverItem`, `reachLocation`, `collectItem`
- Completion triggers the Mission Complete overlay, then activates the next mission

---

## 5. NPC Dialogue System

### Interaction
- Player walks adjacent to an NPC, a prompt appears ("Press Space to talk")
- Space/Enter opens the dialogue overlay (HTML panel over canvas)
- Canvas input paused during dialogue

### Dialogue Structure
```js
{
  npcId: "shopkeeper",
  name: "Shopkeeper",
  lines: [
    {
      text: "Welcome! What can I get you?",
      choices: [
        { label: "Buy Tea", action: "completeMission", missionId: "buyTea" },
        { label: "Goodbye", action: "closeDialogue" }
      ]
    }
  ]
}
```

- Choices can trigger: `completeMission`, `giveItem`, `closeDialogue`, `nextLine`
- Multi-step conversations supported via `nextLine` chaining

---

## 6. UI Screens

### Landing Screen
- Full-screen background (CSS gradient, pixel-art aesthetic)
- Game title (large, styled)
- Buttons: **Start Game** → LevelSelect, **Settings** → overlay, **Credits** → overlay
- Settings overlay: sound on/off toggle, keyboard controls reference

### Level Select Screen
- Grid of 5 level cards
- Each card: level name, setting thumbnail (colored tile preview), lock icon if locked, star rating (0–3 stars based on mission speed)
- Back button → Landing

### In-Game HUD (rendered in canvas)
- Top bar: Level name (left), Mission progress "2/3" (right)
- Bottom bar: Current mission objective text
- NPC interaction prompt near player when adjacent to NPC

### Mission Complete Overlay (HTML over canvas)
- Mission name + ✓ checkmark
- Time taken
- Buttons: **Next Mission** (if more remain) or **Level Complete → Back to Map**

---

## 7. Data Persistence

- `localStorage` key: `missionGame_progress`
- Stores: unlocked levels, completed missions per level, star ratings
- On first load: initializes with Level 1 unlocked, all missions incomplete

---

## 8. Out of Scope (for this version)
- Sound/music (toggle in settings is UI-only for now)
- Animated sprites (placeholder colored rectangles for MVP)
- Mobile/touch controls
- Multiplayer
- Save slots / multiple profiles
