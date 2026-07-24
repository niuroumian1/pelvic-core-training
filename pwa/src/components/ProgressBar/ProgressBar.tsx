interface ProgressBarProps {
  current: number
  total: number
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (current / total) * 100))

  return (
    <div className="training-progress">
      <div className="training-progress__label">
        <span><small>SESSION</small> 训练进度</span>
        <strong>
          {current} / {total}
        </strong>
      </div>
      <div
        className="training-progress__track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={current}
      >
        <span style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}
