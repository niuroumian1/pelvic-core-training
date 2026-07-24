export type KegelPhase = 'READY' | 'CONTRACT' | 'HOLD' | 'RELAX' | 'SUCCESS'

export interface TimedPhaseDefinition<Phase extends string> {
  phase: Phase
  durationMs: number
}

export interface TimedTrainingProtocol<Phase extends string> {
  id: string
  ready: TimedPhaseDefinition<Phase>
  workPhases: readonly TimedPhaseDefinition<Phase>[]
  successPhase: Phase
  totalSets: number
}

export interface TrainingSnapshot<Phase extends string> {
  phase: Phase
  phaseKind: 'ready' | 'work' | 'success'
  phaseIndex: number
  currentSet: number
  totalSets: number
  durationMs: number
  remainingMs: number
  phaseProgress: number
}

export type TrainingDifficulty = 'easy' | 'moderate' | 'hard'

export interface UserFeedback {
  difficulty?: TrainingDifficulty
  note?: string
}

export interface TrainingSession {
  id: string
  exerciseId: string
  exerciseType: string
  startedAt: string
  endedAt: string
  completed: boolean
  completedSets: number
  score: number
  feedback?: UserFeedback
}

export interface TrainingSummary {
  totalCompletions: number
  currentStreakDays: number
  totalExperience: number
  currentLevel: number
}

export interface LocalTrainingData {
  schemaVersion: 1
  sessions: TrainingSession[]
  summary: TrainingSummary
}
