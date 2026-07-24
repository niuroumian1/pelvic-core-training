import { describe, expect, it } from 'vitest'
import type { KeyValueStorage } from './storageService'
import { StorageService } from './storageService'

function memoryStorage(): KeyValueStorage {
  const values = new Map<string, string>()
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  }
}

function completion(id: string, endedAt: string) {
  return {
    id,
    exerciseId: 'kegel-basic',
    exerciseType: 'kegel',
    startedAt: endedAt,
    endedAt,
    completedSets: 3,
  }
}

describe('StorageService', () => {
  it('stores a completed training session once', () => {
    const service = new StorageService(memoryStorage(), () => new Date('2026-07-24T12:00:00'))
    service.recordCompletion(completion('one', '2026-07-24T10:00:00'))
    service.recordCompletion(completion('one', '2026-07-24T10:00:00'))

    expect(service.getData().sessions).toHaveLength(1)
    expect(service.getData().summary).toMatchObject({
      totalCompletions: 1,
      totalExperience: 10,
      currentStreakDays: 1,
      currentLevel: 1,
    })
  })

  it('calculates consecutive training days', () => {
    const service = new StorageService(memoryStorage(), () => new Date('2026-07-24T12:00:00'))
    service.recordCompletion(completion('one', '2026-07-22T10:00:00'))
    service.recordCompletion(completion('two', '2026-07-23T10:00:00'))
    service.recordCompletion(completion('three', '2026-07-24T10:00:00'))

    expect(service.getData().summary.currentStreakDays).toBe(3)
  })

  it('updates user feedback without creating another session', () => {
    const service = new StorageService(memoryStorage())
    service.recordCompletion(completion('one', '2026-07-24T10:00:00'))
    service.updateFeedback('one', 'moderate')

    expect(service.getData().sessions).toHaveLength(1)
    expect(service.getData().sessions[0].feedback?.difficulty).toBe('moderate')
  })
})
