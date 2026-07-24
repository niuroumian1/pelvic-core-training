import type {
  LocalTrainingData,
  TrainingDifficulty,
  TrainingSession,
  TrainingSummary,
} from '../models/training'

const STORAGE_KEY = 'pelvic-core-training:data'
const EXPERIENCE_PER_COMPLETION = 10

export interface KeyValueStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export interface CompletionInput {
  id: string
  exerciseId: string
  exerciseType: string
  startedAt: string
  endedAt: string
  completedSets: number
}

const emptySummary: TrainingSummary = {
  totalCompletions: 0,
  currentStreakDays: 0,
  totalExperience: 0,
  currentLevel: 1,
}

const browserStorage: KeyValueStorage = {
  getItem: (key) => globalThis.localStorage.getItem(key),
  setItem: (key, value) => globalThis.localStorage.setItem(key, value),
}

function localDateKey(value: string | Date) {
  const date = typeof value === 'string' ? new Date(value) : value
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function dayKey(date: Date, offset: number) {
  const shifted = new Date(date)
  shifted.setHours(12, 0, 0, 0)
  shifted.setDate(shifted.getDate() + offset)
  return localDateKey(shifted)
}

export function calculateSummary(
  sessions: TrainingSession[],
  now = new Date(),
): TrainingSummary {
  const completed = sessions.filter((session) => session.completed)
  const completedDays = new Set(completed.map((session) => localDateKey(session.endedAt)))
  const startOffset = completedDays.has(dayKey(now, 0)) ? 0 : -1
  let currentStreakDays = 0

  for (let offset = startOffset; completedDays.has(dayKey(now, offset)); offset -= 1) {
    currentStreakDays += 1
  }

  const totalExperience = completed.length * EXPERIENCE_PER_COMPLETION

  return {
    totalCompletions: completed.length,
    currentStreakDays,
    totalExperience,
    currentLevel: Math.floor(totalExperience / 100) + 1,
  }
}

function isStoredData(value: unknown): value is LocalTrainingData {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<LocalTrainingData>
  return candidate.schemaVersion === 1 && Array.isArray(candidate.sessions)
}

export class StorageService {
  constructor(
    private readonly storage: KeyValueStorage = browserStorage,
    private readonly now: () => Date = () => new Date(),
  ) {}

  getData(): LocalTrainingData {
    try {
      const raw = this.storage.getItem(STORAGE_KEY)
      if (!raw) return { schemaVersion: 1, sessions: [], summary: emptySummary }

      const parsed: unknown = JSON.parse(raw)
      if (!isStoredData(parsed)) {
        return { schemaVersion: 1, sessions: [], summary: emptySummary }
      }

      return {
        schemaVersion: 1,
        sessions: parsed.sessions,
        summary: calculateSummary(parsed.sessions, this.now()),
      }
    } catch {
      return { schemaVersion: 1, sessions: [], summary: emptySummary }
    }
  }

  recordCompletion(input: CompletionInput): LocalTrainingData {
    const data = this.getData()
    if (data.sessions.some((session) => session.id === input.id)) return data

    const session: TrainingSession = {
      ...input,
      completed: true,
      score: EXPERIENCE_PER_COMPLETION,
    }
    const sessions = [session, ...data.sessions]
    return this.save(sessions)
  }

  updateFeedback(id: string, difficulty: TrainingDifficulty): LocalTrainingData {
    const data = this.getData()
    const sessions = data.sessions.map((session) =>
      session.id === id
        ? { ...session, feedback: { ...session.feedback, difficulty } }
        : session,
    )
    return this.save(sessions)
  }

  isCompletedToday() {
    const today = localDateKey(this.now())
    return this.getData().sessions.some(
      (session) => session.completed && localDateKey(session.endedAt) === today,
    )
  }

  private save(sessions: TrainingSession[]): LocalTrainingData {
    const data: LocalTrainingData = {
      schemaVersion: 1,
      sessions,
      summary: calculateSummary(sessions, this.now()),
    }
    this.storage.setItem(STORAGE_KEY, JSON.stringify(data))
    return data
  }
}

export function createTrainingSessionId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  return `session-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export const storageService = new StorageService()

