import type { ReactNode } from 'react'

interface AnimationStageProps {
  children: ReactNode
  themeId: string
  variant?: 'preview' | 'training'
}

export function AnimationStage({
  children,
  themeId,
  variant = 'preview',
}: AnimationStageProps) {
  return (
    <div
      className={`animation-stage animation-stage--${variant} animation-theme--${themeId}`}
      data-animation-theme={themeId}
    >
      {children}
    </div>
  )
}

