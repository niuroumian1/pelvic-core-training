import { describe, expect, it } from 'vitest'
import { kegelProtocol } from './kegelProtocol'
import {
  advanceTraining,
  createInitialSnapshot,
  TrainingEngine,
  type TrainingScheduler,
} from './trainingEngine'

class FakeScheduler implements TrainingScheduler {
  private callbacks = new Map<number, () => void>()
  private nextHandle = 1
  private currentTime = 0

  intervalRegistrations = 0

  now = () => this.currentTime

  setInterval = (callback: () => void) => {
    const handle = this.nextHandle++
    this.callbacks.set(handle, callback)
    this.intervalRegistrations += 1
    return handle
  }

  clearInterval = (handle: number) => {
    this.callbacks.delete(handle)
  }

  advance = (elapsedMs: number) => {
    this.currentTime += elapsedMs
    this.callbacks.forEach((callback) => callback())
  }
}

describe('trainingEngine', () => {
  it('starts in READY with a three-second countdown', () => {
    const state = createInitialSnapshot(kegelProtocol)

    expect(state).toMatchObject({
      phase: 'READY',
      currentSet: 1,
      totalSets: 3,
      remainingMs: 3_000,
    })
  })

  it('moves through the configured kegel phases', () => {
    let state = createInitialSnapshot(kegelProtocol)

    state = advanceTraining(state, 3_000, kegelProtocol)
    expect(state).toMatchObject({ phase: 'CONTRACT', remainingMs: 5_000 })

    state = advanceTraining(state, 5_000, kegelProtocol)
    expect(state).toMatchObject({ phase: 'HOLD', remainingMs: 3_000 })

    state = advanceTraining(state, 3_000, kegelProtocol)
    expect(state).toMatchObject({ phase: 'RELAX', remainingMs: 5_000 })
  })

  it('starts the next set after RELAX without repeating READY', () => {
    const state = advanceTraining(
      createInitialSnapshot(kegelProtocol),
      3_000 + 5_000 + 3_000 + 5_000,
      kegelProtocol,
    )

    expect(state).toMatchObject({
      phase: 'CONTRACT',
      currentSet: 2,
      remainingMs: 5_000,
    })
  })

  it('reaches SUCCESS after all three sets', () => {
    const totalDuration = 3_000 + 3 * (5_000 + 3_000 + 5_000)
    const state = advanceTraining(
      createInitialSnapshot(kegelProtocol),
      totalDuration,
      kegelProtocol,
    )

    expect(state).toMatchObject({
      phase: 'SUCCESS',
      currentSet: 3,
      phaseProgress: 1,
    })
  })

  it('carries excess elapsed time into the next phase', () => {
    const state = advanceTraining(
      createInitialSnapshot(kegelProtocol),
      3_500,
      kegelProtocol,
    )

    expect(state).toMatchObject({
      phase: 'CONTRACT',
      remainingMs: 4_500,
    })
  })

  it('excludes paused wall time from the READY countdown', () => {
    const scheduler = new FakeScheduler()
    const engine = new TrainingEngine(kegelProtocol, scheduler)

    engine.start()
    scheduler.advance(1_000)
    engine.pause()
    scheduler.advance(5_000)
    engine.resume()
    scheduler.advance(500)

    expect(engine.getSnapshot()).toMatchObject({
      phase: 'READY',
      remainingMs: 1_500,
    })
  })

  it('makes duplicate pause and resume calls safe without duplicate timers', () => {
    const scheduler = new FakeScheduler()
    const engine = new TrainingEngine(kegelProtocol, scheduler)

    engine.start()
    engine.pause()
    engine.pause()
    engine.resume()
    engine.resume()

    expect(engine.isPaused()).toBe(false)
    expect(scheduler.intervalRegistrations).toBe(2)
  })

  it('preserves the snapshot while pause clears the active interval', () => {
    const scheduler = new FakeScheduler()
    const engine = new TrainingEngine(kegelProtocol, scheduler)

    engine.start()
    scheduler.advance(1_000)
    engine.pause()
    const pausedSnapshot = engine.getSnapshot()
    scheduler.advance(5_000)

    expect(engine.getSnapshot()).toEqual(pausedSnapshot)
  })

  it('does not restart after reaching SUCCESS', () => {
    const scheduler = new FakeScheduler()
    const engine = new TrainingEngine(kegelProtocol, scheduler)

    engine.start()
    scheduler.advance(42_000)
    engine.stop()
    engine.start()

    expect(engine.getSnapshot().phase).toBe('SUCCESS')
    expect(scheduler.intervalRegistrations).toBe(1)
  })
})

