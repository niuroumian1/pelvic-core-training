import type { CSSProperties } from 'react'
import { EnergyCore } from '../../components/EnergyCore/EnergyCore'
import type { KegelPhase } from '../../models/training'
import type { AnimationProviderProps } from '../animationManager'

const particleCount = 16

function normalizePhase(phase: string): KegelPhase {
  if (
    phase === 'READY' ||
    phase === 'CONTRACT' ||
    phase === 'HOLD' ||
    phase === 'RELAX' ||
    phase === 'SUCCESS'
  ) {
    return phase
  }

  return 'READY'
}

function getMotion(phase: KegelPhase, progress: number) {
  if (phase === 'CONTRACT') {
    return {
      compression: progress,
      release: 0,
      particleDistance: 86 - progress * 58,
      particleOpacity: 0.45 + progress * 0.5,
    }
  }

  if (phase === 'HOLD') {
    return {
      compression: 1,
      release: 0,
      particleDistance: 28,
      particleOpacity: 0.95,
    }
  }

  if (phase === 'RELAX') {
    return {
      compression: 1 - progress,
      release: progress,
      particleDistance: 28 + progress * 102,
      particleOpacity: 0.95 - progress * 0.82,
    }
  }

  return {
    compression: 0,
    release: 0,
    particleDistance: 86,
    particleOpacity: 0.42,
  }
}

export function EnergyCoreAnimation({ state }: AnimationProviderProps) {
  const phase = normalizePhase(state.phase)
  const progress = Math.min(1, Math.max(0, state.phaseProgress))
  const motion = getMotion(phase, progress)
  const coreScale = 1 - motion.compression * 0.26
  const fieldScale = 1 - motion.compression * 0.18 + motion.release * 0.36
  const waveOpacity = phase === 'RELAX' ? Math.max(0, 0.8 - motion.release * 0.72) : 0

  return (
    <div className="energy-gameplay" data-phase={phase}>
      <div
        className="energy-gameplay__field"
        style={{
          opacity: 0.48 + motion.compression * 0.42,
          transform: `scale(${fieldScale})`,
        }}
      />

      <div className="energy-gameplay__waves" aria-hidden="true">
        <span
          style={{
            opacity: waveOpacity,
            transform: `scale(${0.68 + motion.release * 0.9})`,
          }}
        />
        <span
          style={{
            opacity: waveOpacity * 0.7,
            transform: `scale(${0.54 + motion.release * 1.3})`,
          }}
        />
      </div>

      <div className="energy-gameplay__particles" aria-hidden="true">
        {Array.from({ length: particleCount }, (_, index) => {
          const angle = (Math.PI * 2 * index) / particleCount
          const depth = 0.82 + (index % 5) * 0.055
          const distance = motion.particleDistance * depth
          const x = Math.cos(angle) * distance
          const y = Math.sin(angle) * distance
          const size = 3 + (index % 3)
          const style: CSSProperties = {
            width: size,
            height: size,
            opacity: motion.particleOpacity,
            transform: `translate(-50%, -50%) translate3d(${x}px, ${y}px, 0)`,
          }

          return <span key={index} style={style} />
        })}
      </div>

      <div
        className="energy-gameplay__core"
        style={{ transform: `scale(${coreScale})` }}
      >
        <EnergyCore compact />
      </div>
    </div>
  )
}

