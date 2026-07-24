import { describe, expect, it } from 'vitest'
import { kegelProtocol } from './kegelProtocol'
import { advanceTraining, createInitialSnapshot } from './trainingEngine'

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
})

