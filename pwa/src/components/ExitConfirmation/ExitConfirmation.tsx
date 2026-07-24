import { useEffect, useRef, type KeyboardEvent, type RefObject } from 'react'

interface ExitConfirmationProps {
  onContinue: () => void
  onExit: () => void
  returnFocusRef?: RefObject<HTMLElement | null>
}

export function ExitConfirmation({
  onContinue,
  onExit,
  returnFocusRef,
}: ExitConfirmationProps) {
  const continueButtonRef = useRef<HTMLButtonElement>(null)
  const exitButtonRef = useRef<HTMLButtonElement>(null)
  const restoreFocusOnUnmountRef = useRef(false)

  useEffect(() => {
    continueButtonRef.current?.focus()

    return () => {
      if (restoreFocusOnUnmountRef.current) {
        returnFocusRef?.current?.focus()
      }
    }
  }, [returnFocusRef])

  const handleContinue = () => {
    restoreFocusOnUnmountRef.current = true
    onContinue()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      handleContinue()
      return
    }

    if (event.key !== 'Tab') return

    if (event.shiftKey && event.target === continueButtonRef.current) {
      event.preventDefault()
      exitButtonRef.current?.focus()
    } else if (!event.shiftKey && event.target === exitButtonRef.current) {
      event.preventDefault()
      continueButtonRef.current?.focus()
    }
  }

  return (
    <div className="exit-confirmation">
      <section
        aria-labelledby="exit-confirmation-title"
        aria-modal="true"
        className="exit-confirmation__panel"
        onKeyDown={handleKeyDown}
        role="dialog"
      >
        <p className="exit-confirmation__eyebrow">TRAINING PAUSED</p>
        <h2 id="exit-confirmation-title">结束本次训练？</h2>
        <p>当前进度不会保存，你也可以继续完成本组训练。</p>
        <button className="primary-action" onClick={handleContinue} ref={continueButtonRef} type="button">
          继续训练
        </button>
        <button className="exit-confirmation__exit" onClick={onExit} ref={exitButtonRef} type="button">
          结束训练
        </button>
      </section>
    </div>
  )
}
