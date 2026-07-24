import type { ComponentType } from 'react'
import { EnergyCoreAnimation } from './energyCore/EnergyCoreAnimation'

export interface AnimationState {
  phase: string
  phaseProgress: number
}

export interface AnimationProviderProps {
  state: AnimationState
}

type AnimationProvider = ComponentType<AnimationProviderProps>

const animationProviders: Record<string, AnimationProvider> = {
  'energy-core': EnergyCoreAnimation,
}

interface AnimationRendererProps {
  animationId: string
  state: AnimationState
}

export function AnimationRenderer({ animationId, state }: AnimationRendererProps) {
  const Provider = animationProviders[animationId]

  if (!Provider) {
    return <p className="animation-unavailable">动画主题暂不可用</p>
  }

  return <Provider state={state} />
}

