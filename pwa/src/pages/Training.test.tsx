import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { Training } from './Training'

const {
  createTrainingSessionId,
  pausedState,
  pause,
  recordCompletion,
  resume,
  updateFeedback,
} = vi.hoisted(() => {
  const pausedState = { value: false }

  return {
    createTrainingSessionId: vi.fn(() => 'training-session-id'),
    pausedState,
    pause: vi.fn(() => {
      pausedState.value = true
    }),
    recordCompletion: vi.fn(),
    resume: vi.fn(() => {
      pausedState.value = false
    }),
    updateFeedback: vi.fn(),
  }
})

vi.mock('../hooks/useTrainingSession', () => ({
  useTrainingSession: () => ({
    snapshot: {
      phase: 'CONTRACT',
      phaseKind: 'work',
      phaseIndex: 0,
      currentSet: 1,
      totalSets: 3,
      durationMs: 5_000,
      remainingMs: 4_000,
      phaseProgress: 0.2,
    },
    pause,
    resume,
    isPaused: pausedState.value,
  }),
}))

vi.mock('../services/storageService', () => ({
  createTrainingSessionId,
  storageService: {
    recordCompletion,
    updateFeedback,
  },
}))

function renderTraining() {
  render(
    <MemoryRouter initialEntries={['/training']}>
      <Routes>
        <Route path="/" element={<p>home sentinel</p>} />
        <Route path="/training" element={<Training />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('Training', () => {
  beforeEach(() => {
    pausedState.value = false
    vi.clearAllMocks()
  })
  afterEach(cleanup)

  it('marks the animation paused while confirming and clears the marker after continuing', async () => {
    const user = userEvent.setup()

    renderTraining()
    const trainingScreen = document.querySelector('.training-screen')

    await user.click(screen.getByRole('button', { name: '返回首页' }))

    expect(
      screen.getByRole('dialog', { name: '结束本次训练？' }),
    ).toBeTruthy()
    expect(pause).toHaveBeenCalledTimes(1)
    expect(screen.queryByText('home sentinel')).toBeNull()
    expect(trainingScreen?.getAttribute('data-training-paused')).toBe('true')

    await user.click(screen.getByRole('button', { name: '继续训练' }))

    expect(
      screen.queryByRole('dialog', { name: '结束本次训练？' }),
    ).toBeNull()
    expect(resume).toHaveBeenCalledTimes(1)
    expect(trainingScreen?.hasAttribute('data-training-paused')).toBe(false)
  })

  it('isolates the training screen while modal and restores focus after continuing', async () => {
    const user = userEvent.setup()

    renderTraining()
    const backButton = screen.getByRole('button', { name: '返回首页' })
    const trainingScreen = document.querySelector('.training-screen')

    await user.click(backButton)

    expect(trainingScreen?.hasAttribute('inert')).toBe(true)

    await user.click(screen.getByRole('button', { name: '继续训练' }))

    expect(trainingScreen?.hasAttribute('inert')).toBe(false)
    expect(document.activeElement).toBe(backButton)
  })

  it('returns home without recording an incomplete session', async () => {
    const user = userEvent.setup()

    renderTraining()

    await user.click(screen.getByRole('button', { name: '返回首页' }))
    await user.click(screen.getByRole('button', { name: '结束训练' }))

    expect(screen.getByText('home sentinel')).toBeTruthy()
    expect(recordCompletion).not.toHaveBeenCalled()
    expect(updateFeedback).not.toHaveBeenCalled()
  })
})
