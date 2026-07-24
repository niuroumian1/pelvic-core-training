import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { Training } from './Training'

const {
  createTrainingSessionId,
  pause,
  recordCompletion,
  resume,
  updateFeedback,
} = vi.hoisted(() => ({
  createTrainingSessionId: vi.fn(() => 'training-session-id'),
  pause: vi.fn(),
  recordCompletion: vi.fn(),
  resume: vi.fn(),
  updateFeedback: vi.fn(),
}))

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
    isPaused: false,
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
  beforeEach(() => vi.clearAllMocks())
  afterEach(cleanup)

  it('pauses before asking whether to exit and resumes when continuing', async () => {
    const user = userEvent.setup()

    renderTraining()

    await user.click(screen.getByRole('button', { name: '返回首页' }))

    expect(
      screen.getByRole('dialog', { name: '结束本次训练？' }),
    ).toBeTruthy()
    expect(pause).toHaveBeenCalledTimes(1)
    expect(screen.queryByText('home sentinel')).toBeNull()

    await user.click(screen.getByRole('button', { name: '继续训练' }))

    expect(
      screen.queryByRole('dialog', { name: '结束本次训练？' }),
    ).toBeNull()
    expect(resume).toHaveBeenCalledTimes(1)
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
