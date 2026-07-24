import { Link } from 'react-router-dom'
import type { TrainingDifficulty } from '../../models/training'

interface ResultPanelProps {
  streakDays: number
  feedback?: TrainingDifficulty
  onFeedback: (difficulty: TrainingDifficulty) => void
}

const feedbackOptions: Array<{ value: TrainingDifficulty; label: string }> = [
  { value: 'easy', label: '轻松' },
  { value: 'moderate', label: '适中' },
  { value: 'hard', label: '吃力' },
]

export function ResultPanel({ streakDays, feedback, onFeedback }: ResultPanelProps) {
  return (
    <section className="result-panel">
      <div className="result-panel__mark" aria-hidden="true">✓</div>
      <p className="overline">SESSION COMPLETE <span>训练完成</span></p>
      <h1>状态很好，训练完成</h1>
      <p className="result-panel__message">你已经完成今天的 3 组核心训练。</p>

      <div className="result-rewards">
        <div>
          <span>训练经验</span>
          <strong>+10</strong>
        </div>
        <div>
          <span>连续训练</span>
          <strong>{streakDays} 天</strong>
        </div>
      </div>

      <div className="result-feedback">
        <p>这次训练感觉如何？</p>
        <div>
          {feedbackOptions.map((option) => (
            <button
              className={feedback === option.value ? 'is-selected' : ''}
              type="button"
              key={option.value}
              onClick={() => onFeedback(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <Link className="primary-action result-panel__action" to="/">
        <span>返回首页</span>
        <span className="primary-action__icon" aria-hidden="true">›</span>
      </Link>
    </section>
  )
}
