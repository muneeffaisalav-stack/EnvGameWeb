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
