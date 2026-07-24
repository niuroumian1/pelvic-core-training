import { Link } from 'react-router-dom'
import { storageService } from '../services/storageService'

const dateFormatter = new Intl.DateTimeFormat('zh-CN', {
  month: 'long',
  day: 'numeric',
  weekday: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

const feedbackLabels = {
  easy: '轻松',
  moderate: '适中',
  hard: '吃力',
}

export function History() {
  const data = storageService.getData()

  return (
    <main className="screen history-screen">
      <header className="history-header">
        <Link className="back-button" to="/" aria-label="返回首页">‹</Link>
        <div>
          <p className="overline">TRAINING LOG <span>训练记录</span></p>
          <h1>你的训练轨迹</h1>
        </div>
      </header>

      <section className="history-summary">
        <div><strong>{data.summary.totalCompletions}</strong><span>完成次数</span></div>
        <div><strong>{data.summary.currentStreakDays}</strong><span>连续天数</span></div>
        <div><strong>{data.summary.totalExperience}</strong><span>总经验</span></div>
      </section>

      {data.sessions.length === 0 ? (
        <section className="history-empty">
          <span aria-hidden="true">○</span>
          <h2>还没有训练记录</h2>
          <p>完成第一次核心训练后，记录会保存在这台设备中。</p>
          <Link className="primary-action" to="/training">
            <span>开始第一次训练</span>
            <span className="primary-action__icon" aria-hidden="true">›</span>
          </Link>
        </section>
      ) : (
        <section className="history-list">
          <h2>最近训练</h2>
          {data.sessions.map((session) => (
            <article className="history-item" key={session.id}>
              <div className="history-item__mark" aria-hidden="true">✓</div>
              <div>
                <strong>能量核心充能</strong>
                <span>{dateFormatter.format(new Date(session.endedAt))}</span>
              </div>
              <div className="history-item__meta">
                <strong>+{session.score}</strong>
                <span>
                  {session.feedback?.difficulty
                    ? feedbackLabels[session.feedback.difficulty]
                    : '已完成'}
                </span>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  )
}

