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
