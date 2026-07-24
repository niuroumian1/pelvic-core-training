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
        <h2 id="exit-confirmation-title">缁撴潫鏈璁粌锛焋</h2>
        <p>褰撳墠杩涘害涓嶄細淇濆瓨锛屼綘涔熷彲浠ョ户缁畬鎴愭湰缁勮缁冦€俙</p>
        <button className="primary-action" onClick={onContinue} ref={continueButtonRef} type="button">
          缁х画璁粌
        </button>
        <button className="exit-confirmation__exit" onClick={onExit} type="button">
          缁撴潫璁粌
        </button>
      </section>
    </div>
  )
}
