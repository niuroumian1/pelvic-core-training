import { useEffect, useRef } from 'react'

interface ExitConfirmationProps {
  onContinue: () => void
  onExit: () => void
}

export function ExitConfirmation({ onContinue, onExit }: ExitConfirmationProps) {
  const continueButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    continueButtonRef.current?.focus()
  }, [])

  return (
    <div className="exit-confirmation">
      <section
        aria-labelledby="exit-confirmation-title"
        aria-modal="true"
        className="exit-confirmation__panel"
        role="dialog"
      >
        <p className="exit-confirmation__eyebrow">TRAINING PAUSED</p>
        <h2 id="exit-confirmation-title">结束本次训练？</h2>
        <p>当前进度不会保存，你也可以继续完成本组训练。</p>
        <button className="primary-action" onClick={onContinue} ref={continueButtonRef} type="button">
          继续训练
        </button>
        <button className="exit-confirmation__exit" onClick={onExit} type="button">
          结束训练
        </button>
      </section>
    </div>
  )
}
