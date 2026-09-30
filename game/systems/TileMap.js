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
