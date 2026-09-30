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
