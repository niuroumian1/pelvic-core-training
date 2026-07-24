import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimationRenderer } from '../animations/animationManager'
import { AnimationStage } from '../components/AnimationStage/AnimationStage'
import { ExitConfirmation } from '../components/ExitConfirmation/ExitConfirmation'
import { ProgressBar } from '../components/ProgressBar/ProgressBar'
import { ResultPanel } from '../components/ResultPanel/ResultPanel'
import { TrainingTimer } from '../components/TrainingTimer/TrainingTimer'
import { useTrainingSession } from '../hooks/useTrainingSession'
import type { KegelPhase, TrainingDifficulty, TrainingSummary } from '../models/training'
import { haptics } from '../platform/vibration'
import {
  createTrainingSessionId,
  storageService,
} from '../services/storageService'

const phaseContent: Record<KegelPhase, { label: string; hint: string }> = {
  READY: { label: '准备', hint: '调整呼吸，集中注意力' },
  CONTRACT: { label: '收缩', hint: '平稳收紧，保持自然呼吸' },
  HOLD: { label: '保持', hint: '稳定输出，不要屏息' },
  RELAX: { label: '放松', hint: '缓慢释放，让肌肉完全放松' },
  SUCCESS: { label: '完成', hint: '训练完成' },
}

const phasePills: Array<{ phase: Exclude<KegelPhase, 'SUCCESS'>; label: string }> = [
  { phase: 'READY', label: '准备' },
  { phase: 'CONTRACT', label: '收缩' },
  { phase: 'HOLD', label: '保持' },
  { phase: 'RELAX', label: '放松' },
]

export function Training() {
  const navigate = useNavigate()
  const { snapshot: training, pause, resume, isPaused } = useTrainingSession()
  const [sessionId] = useState(createTrainingSessionId)
  const [startedAt] = useState(() => new Date().toISOString())
  const [savedSummary, setSavedSummary] = useState<TrainingSummary>()
  const [feedback, setFeedback] = useState<TrainingDifficulty>()
  const [showExitConfirmation, setShowExitConfirmation] = useState(false)
  const backButtonRef = useRef<HTMLButtonElement>(null)
  const hasSaved = useRef(false)
  const previousPhase = useRef<KegelPhase>()

  useEffect(() => {
    if (previousPhase.current === training.phase) return
    previousPhase.current = training.phase

    if (training.phase === 'CONTRACT') haptics.trigger('medium')
    else if (training.phase === 'RELAX') haptics.trigger('release')
    else if (training.phase === 'SUCCESS') haptics.trigger('success')
    else haptics.trigger('light')
  }, [training.phase])

  useEffect(() => {
    if (training.phase !== 'SUCCESS' || hasSaved.current) return

    hasSaved.current = true
    const data = storageService.recordCompletion({
      id: sessionId,
      exerciseId: 'kegel-basic',
      exerciseType: 'kegel',
      startedAt,
      endedAt: new Date().toISOString(),
      completedSets: training.totalSets,
    })
    setSavedSummary(data.summary)
  }, [sessionId, startedAt, training.phase, training.totalSets])

  const handleFeedback = (difficulty: TrainingDifficulty) => {
    storageService.updateFeedback(sessionId, difficulty)
    setFeedback(difficulty)
  }

  const handleRequestExit = () => {
    pause()
    setShowExitConfirmation(true)
  }

  const handleContinue = () => {
    setShowExitConfirmation(false)
    resume()
  }

  const handleExit = () => {
    navigate('/')
  }

  if (training.phase === 'SUCCESS') {
    return (
      <main className="screen result-screen">
        <ResultPanel
          streakDays={savedSummary?.currentStreakDays ?? 1}
          feedback={feedback}
          onFeedback={handleFeedback}
        />
      </main>
    )
  }

  const content = phaseContent[training.phase]
  const remainingSeconds = Math.ceil(training.remainingMs / 1_000)
  const backgroundIsolationProps = showExitConfirmation ? { inert: '' } : {}

  return (
    <>
      <main
        {...backgroundIsolationProps}
        className="screen training-screen"
        data-training-paused={isPaused ? 'true' : undefined}
      >
        <header className="training-header">
          <button
            aria-label="返回首页"
            className="back-button"
            onClick={handleRequestExit}
            ref={backButtonRef}
            type="button"
          >
            ‹
          </button>
          <div>
            <span className="training-theme-label">ENERGY CORE</span>
            <h1>能量核心充能</h1>
            <p>第 {training.currentSet} / {training.totalSets} 组</p>
          </div>
          <span className="training-header__spacer" aria-hidden="true" />
        </header>

        <ProgressBar current={training.currentSet} total={training.totalSets} />

        <AnimationStage themeId="energy-core" variant="training">
          <AnimationRenderer
            animationId="energy-core"
            state={{
              phase: training.phase,
              phaseProgress: training.phaseProgress,
            }}
          />
          <TrainingTimer
            label={content.label}
            value={String(remainingSeconds)}
            hint={content.hint}
          />
        </AnimationStage>

        <ol className="phase-pills" aria-label="训练流程">
          {phasePills.map((item) => (
            <li
              className={training.phase === item.phase ? 'phase-pill is-active' : 'phase-pill'}
              key={item.phase}
            >
              {item.label}
            </li>
          ))}
        </ol>

        <p className="training-guidance">
          <span aria-hidden="true">●</span>
          保持身体放松，只专注于盆底肌区域
        </p>
      </main>
      {showExitConfirmation && (
        <ExitConfirmation
          onContinue={handleContinue}
          onExit={handleExit}
          returnFocusRef={backButtonRef}
        />
      )}
    </>
  )
}
