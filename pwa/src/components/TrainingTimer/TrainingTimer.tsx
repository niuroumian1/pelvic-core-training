interface TrainingTimerProps {
  label: string
  value: string
  hint: string
}

export function TrainingTimer({ label, value, hint }: TrainingTimerProps) {
  return (
    <section className="training-timer" aria-live="polite">
      <p className="training-timer__label">{label}</p>
      <strong className="training-timer__value">{value}</strong>
      <p className="training-timer__hint">{hint}</p>
    </section>
  )
}

