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
