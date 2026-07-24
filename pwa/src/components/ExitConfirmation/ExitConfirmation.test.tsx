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

  it('loops focus across the first and last buttons', async () => {
    const user = userEvent.setup()

    render(<ExitConfirmation onContinue={vi.fn()} onExit={vi.fn()} />)

    const continueButton = screen.getByRole('button', { name: '继续训练' })
    const exitButton = screen.getByRole('button', { name: '结束训练' })

    exitButton.focus()
    await user.tab()
    expect(document.activeElement).toBe(continueButton)

    continueButton.focus()
    await user.tab({ shift: true })
    expect(document.activeElement).toBe(exitButton)
  })

  it('treats Escape as the safe continue action', async () => {
    const onContinue = vi.fn()
    const onExit = vi.fn()
    const user = userEvent.setup()

    render(<ExitConfirmation onContinue={onContinue} onExit={onExit} />)

    await user.keyboard('{Escape}')

    expect(onContinue).toHaveBeenCalledTimes(1)
    expect(onExit).not.toHaveBeenCalled()
  })

  it('invokes onExit once when the exit button is clicked', async () => {
    const onExit = vi.fn()
    const user = userEvent.setup()

    render(<ExitConfirmation onContinue={vi.fn()} onExit={onExit} />)

    await user.click(screen.getByRole('button', { name: '结束训练' }))

    expect(onExit).toHaveBeenCalledTimes(1)
  })
})
