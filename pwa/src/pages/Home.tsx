import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimationStage } from '../components/AnimationStage/AnimationStage'
import { EnergyCore } from '../components/EnergyCore/EnergyCore'
import { appConfig } from '../config/appConfig'
import { installService } from '../platform/installPrompt'
import { storageService } from '../services/storageService'

const trainingPhases = [
  { name: '收缩', duration: '5 秒' },
  { name: '保持', duration: '3 秒' },
  { name: '放松', duration: '5 秒' },
]

export function Home() {
  const trainingData = storageService.getData()
  const completedToday = storageService.isCompletedToday()
  const [canInstall, setCanInstall] = useState(installService.canInstall)

  useEffect(() => installService.subscribe(setCanInstall), [])

  return (
    <main className="screen home-screen">
      <header className="home-header">
        <p className="app-name">{appConfig.shortName}</p>
        <div className="home-actions">
          <Link className="history-link" to="/history">记录</Link>
          <span className={completedToday ? 'today-status is-complete' : 'today-status'}>
            {completedToday ? '今日已完成' : '今日待训练'}
          </span>
        </div>
      </header>

      <section className="home-intro">
        <p className="intro-overline">DAILY PRACTICE <span>今日训练</span></p>
        <h1>今天，完成一次<br />核心训练</h1>
        <p className="intro-copy">用不到一分钟，跟随节奏完成 3 组练习。</p>
      </section>

      <section className="session-card">
        <AnimationStage themeId="energy-core">
          <EnergyCore />
          <span className="stage-caption">Energy Core</span>
        </AnimationStage>

        <div className="session-card__content">
          <div>
            <p className="overline">TRAINING THEME <span>本次主题</span></p>
            <h2>能量核心充能</h2>
          </div>
          <p>跟随呼吸控制能量聚合与释放，找到稳定、清晰的训练节奏。</p>

          <div className="session-facts">
            <span><strong>3</strong> 组训练</span>
            <span>
              <strong>{trainingData.summary.currentStreakDays}</strong> 天连续
            </span>
          </div>
        </div>
      </section>

      <section className="routine-summary">
        <div className="routine-summary__heading">
          <div>
            <p className="overline">TRAINING RHYTHM <span>训练节奏</span></p>
            <h2>收紧、稳定、释放</h2>
          </div>
          <span>每组 13 秒</span>
        </div>

        <div className="routine-steps" aria-label="训练阶段">
          {trainingPhases.map((phase) => (
            <div className="routine-step" key={phase.name}>
              <span className="routine-step__dot" />
              <div>
                <strong>{phase.name}</strong>
                <span>{phase.duration}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Link className="primary-action" to="/training">
        <span>开始训练</span>
        <span className="primary-action__icon" aria-hidden="true">›</span>
      </Link>
      {canInstall ? (
        <button
          className="install-action"
          type="button"
          onClick={() => void installService.promptInstall()}
        >
          安装到手机
        </button>
      ) : null}
      <p className="home-footnote">保持自然呼吸，身体放松即可</p>
    </main>
  )
}
