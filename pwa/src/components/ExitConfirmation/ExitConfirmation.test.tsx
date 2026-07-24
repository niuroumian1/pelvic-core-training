import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ExitConfirmation } from './ExitConfirmation'

afterEach(cleanup)

describe('ExitConfirmation', () => {
  it('exposes an accessible dialog, focuses continue, and invokes onContinue once', async () => {
    const onContinue = vi.fn()
    const user = userEvent.setup()

    render(<ExitConfirmation onContinue={onContinue} onExit={vi.fn()} />)

    expect(
      screen.getByRole('dialog', { name: '结束本次训练？' }),
    ).toBeTruthy()

    const continueButton = screen.getByRole('button', { name: '继续训练' })
    expect(document.activeElement).toBe(continueButton)

    await user.click(continueButton)

    expect(onContinue).toHaveBeenCalledTimes(1)
  })

  it('invokes onExit once when the exit button is clicked', async () => {
    const onExit = vi.fn()
    const user = userEvent.setup()

    render(<ExitConfirmation onContinue={vi.fn()} onExit={onExit} />)

    await user.click(screen.getByRole('button', { name: '结束训练' }))

    expect(onExit).toHaveBeenCalledTimes(1)
  })
})
