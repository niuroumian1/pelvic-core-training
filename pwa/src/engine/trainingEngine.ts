import type {
  TimedPhaseDefinition,
  TimedTrainingProtocol,
  TrainingSnapshot,
} from '../models/training'

type Listener<Phase extends string> = (snapshot: TrainingSnapshot<Phase>) => void

export interface TrainingScheduler {
  now(): number
  setInterval(callback: () => void, intervalMs: number): number
  clearInterval(handle: number): void
}

const defaultScheduler: TrainingScheduler = {
  now: () => Date.now(),
  setInterval: (callback, intervalMs) => window.setInterval(callback, intervalMs),
  clearInterval: (handle) => window.clearInterval(handle),
}

function phaseSnapshot<Phase extends string>(
  definition: TimedPhaseDefinition<Phase>,
  phaseKind: 'ready' | 'work',
  phaseIndex: number,
  currentSet: number,
  totalSets: number,
): TrainingSnapshot<Phase> {
  return {
    phase: definition.phase,
    phaseKind,
    phaseIndex,
    currentSet,
    totalSets,
    durationMs: definition.durationMs,
    remainingMs: definition.durationMs,
    phaseProgress: 0,
  }
}

export function createInitialSnapshot<Phase extends string>(
  protocol: TimedTrainingProtocol<Phase>,
): TrainingSnapshot<Phase> {
  return phaseSnapshot(protocol.ready, 'ready', -1, 1, protocol.totalSets)
}

function nextPhase<Phase extends string>(
  snapshot: TrainingSnapshot<Phase>,
  protocol: TimedTrainingProtocol<Phase>,
): TrainingSnapshot<Phase> {
  if (snapshot.phaseKind === 'ready') {
    return phaseSnapshot(protocol.workPhases[0], 'work', 0, 1, protocol.totalSets)
  }

  if (snapshot.phaseIndex < protocol.workPhases.length - 1) {
    const nextIndex = snapshot.phaseIndex + 1
    return phaseSnapshot(
      protocol.workPhases[nextIndex],
      'work',
      nextIndex,
      snapshot.currentSet,
      protocol.totalSets,
    )
  }

  if (snapshot.currentSet < protocol.totalSets) {
    return phaseSnapshot(
      protocol.workPhases[0],
      'work',
      0,
      snapshot.currentSet + 1,
      protocol.totalSets,
    )
  }

  return {
    phase: protocol.successPhase,
    phaseKind: 'success',
    phaseIndex: protocol.workPhases.length,
    currentSet: protocol.totalSets,
    totalSets: protocol.totalSets,
    durationMs: 0,
    remainingMs: 0,
    phaseProgress: 1,
  }
}

export function advanceTraining<Phase extends string>(
  snapshot: TrainingSnapshot<Phase>,
  elapsedMs: number,
  protocol: TimedTrainingProtocol<Phase>,
): TrainingSnapshot<Phase> {
  if (elapsedMs <= 0 || snapshot.phaseKind === 'success') {
    return snapshot
  }

  let current = snapshot
  let remainingElapsed = elapsedMs

  while (remainingElapsed >= current.remainingMs && current.phaseKind !== 'success') {
    remainingElapsed -= current.remainingMs
    current = nextPhase(current, protocol)
  }

  if (current.phaseKind === 'success' || remainingElapsed === 0) {
    return current
  }

  const remainingMs = Math.max(0, current.remainingMs - remainingElapsed)

  return {
    ...current,
    remainingMs,
    phaseProgress: Math.min(1, 1 - remainingMs / current.durationMs),
  }
}

export class TrainingEngine<Phase extends string> {
  private snapshot: TrainingSnapshot<Phase>
  private listeners = new Set<Listener<Phase>>()
  private intervalHandle: number | null = null
  private lastTickAt = 0
  private paused = false

  constructor(
    private readonly protocol: TimedTrainingProtocol<Phase>,
    private readonly scheduler: TrainingScheduler = defaultScheduler,
  ) {
    if (protocol.workPhases.length === 0) {
      throw new Error('Training protocol requires at least one work phase.')
    }

    this.snapshot = createInitialSnapshot(protocol)
  }

  getSnapshot = () => this.snapshot

  subscribe = (listener: Listener<Phase>) => {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  start = () => {
    if (
      this.intervalHandle !== null ||
      this.paused ||
      this.snapshot.phaseKind === 'success'
    ) {
      return
    }

    this.lastTickAt = this.scheduler.now()
    this.intervalHandle = this.scheduler.setInterval(this.tick, 100)
  }

  stop = () => {
    if (this.intervalHandle !== null) {
      this.scheduler.clearInterval(this.intervalHandle)
      this.intervalHandle = null
    }

    this.paused = false
  }

  pause = () => {
    if (this.intervalHandle === null) {
      return
    }

    this.scheduler.clearInterval(this.intervalHandle)
    this.intervalHandle = null
    this.paused = true
  }

  resume = () => {
    if (!this.paused || this.snapshot.phaseKind === 'success') {
      return
    }

    this.lastTickAt = this.scheduler.now()
    this.intervalHandle = this.scheduler.setInterval(this.tick, 100)
    this.paused = false
  }

  isPaused = () => this.paused

  private tick = () => {
    const now = this.scheduler.now()
    const elapsedMs = Math.max(0, now - this.lastTickAt)
    this.lastTickAt = now
    this.snapshot = advanceTraining(this.snapshot, elapsedMs, this.protocol)
    this.listeners.forEach((listener) => listener(this.snapshot))

    if (this.snapshot.phaseKind === 'success') {
      this.stop()
    }
  }
}

