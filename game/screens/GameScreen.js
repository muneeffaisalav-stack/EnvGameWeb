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
    this._dialogue          = new DialogueSystem(document.getElementById('dialogue-overlay'))
    this._mOverlay          = document.getElementById('mission-overlay')
    this._adjacentNpc        = null
    this._showPrompt         = false
    this._missionOverlayOpen = false
    this._touchCleanup       = null
  }

  mount() {
    this._canvas.style.display = 'block'
    document.getElementById('screen-container').innerHTML = ''
    this._missionStartTime = Date.now()

    this._keyHandler = e => this._handleKey(e)
    window.addEventListener('keydown', this._keyHandler)
    this._touchCleanup = this._initTouchControls()
    this._loop()
  }

  unmount() {
    if (this._rafId) cancelAnimationFrame(this._rafId)
    this._rafId = null
    window.removeEventListener('keydown', this._keyHandler)
    if (this._touchCleanup) { this._touchCleanup(); this._touchCleanup = null }
    this._canvas.style.display = 'none'
    this._dialogue.close()
    this._mOverlay.innerHTML = ''
    this._mOverlay.style.display = 'none'
  }

  _handleKey(e) {
    if (e.code === 'Escape') {
      e.preventDefault()
      this._game.switchScreen('levelSelect')
      return
    }
    if (this._dialogue.isOpen() || this._missionOverlayOpen) return
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
    const active = this._missionSys.getActiveMission()
    const isMissionTarget = active?.objectiveType === 'talkTo' && active?.targetNpcId === npc.id
    if (!isMissionTarget) {
      this._dialogue.open({
        npcId: npc.id, name: data.name,
        lines: [{ text: 'I am busy right now. Come back later.', choices: [{ label: 'OK', action: 'closeDialogue' }] }]
      }, () => {})
      return
    }
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
    this._missionOverlayOpen = true
    overlay.style.display = 'flex'
    overlay.innerHTML = `
      <div style="background:#1a1a2e;border:2px solid #f0c040;padding:40px 48px;
                  text-align:center;font-family:'Courier New',monospace;min-width:340px;">
        <div style="font-size:48px;margin-bottom:8px;">&#10003;</div>
        <div style="color:#f0c040;font-size:20px;letter-spacing:3px;margin-bottom:8px;">
          MISSION COMPLETE
        </div>
        <div style="color:#eee;font-size:16px;margin-bottom:4px;">${mission?.title ?? missionId}</div>
        <div style="color:#888;font-size:13px;margin-bottom:28px;">Time: ${elapsedSeconds}s</div>
        ${isLevelComplete
          ? `<button class="btn" id="ov-map" style="width:100%;">&#8592; BACK TO MAP</button>`
          : `<button class="btn" id="ov-next" style="width:100%;">NEXT MISSION &#8594;</button>`}
      </div>
    `
    if (isLevelComplete) {
      overlay.querySelector('#ov-map').addEventListener('click', () => {
        this._missionOverlayOpen = false
        this._game.switchScreen('levelSelect')
      })
    } else {
      overlay.querySelector('#ov-next').addEventListener('click', () => {
        this._missionOverlayOpen = false
        overlay.style.display = 'none'
        overlay.innerHTML = ''
      })
    }
  }

  _initTouchControls() {
    const tc = document.getElementById('touch-controls')
    if (!tc) return () => {}
    tc.style.display = 'flex'
    const cleanups = []

    const addDir = (id, dc, dr) => {
      const btn = tc.querySelector(`#${id}`)
      if (!btn) return
      let timer = null
      const move = () => {
        if (this._dialogue.isOpen() || this._missionOverlayOpen) return
        this._player.tryMove(dc, dr, this._tileMap)
        this._checkReachLocation()
      }
      const onStart = e => { e.preventDefault(); move(); timer = setInterval(move, 140) }
      const onStop  = () => { clearInterval(timer); timer = null }
      btn.addEventListener('touchstart', onStart, { passive: false })
      btn.addEventListener('touchend',   onStop)
      btn.addEventListener('touchcancel', onStop)
      cleanups.push(() => {
        btn.removeEventListener('touchstart', onStart)
        btn.removeEventListener('touchend',   onStop)
        btn.removeEventListener('touchcancel', onStop)
        clearInterval(timer)
      })
    }

    addDir('btn-up',    0, -1)
    addDir('btn-down',  0,  1)
    addDir('btn-left', -1,  0)
    addDir('btn-right', 1,  0)

    const actionBtn = tc.querySelector('#btn-action')
    if (actionBtn) {
      const onAction = e => {
        e.preventDefault()
        if (this._dialogue.isOpen() || this._missionOverlayOpen) return
        if (this._adjacentNpc) this._openDialogue(this._adjacentNpc)
      }
      actionBtn.addEventListener('touchstart', onAction, { passive: false })
      cleanups.push(() => actionBtn.removeEventListener('touchstart', onAction))
    }

    return () => { cleanups.forEach(fn => fn()); tc.style.display = 'none' }
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
