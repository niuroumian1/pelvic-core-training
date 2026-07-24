export type HapticFeedback = 'light' | 'medium' | 'release' | 'success'

export interface HapticsPort {
  isSupported(): boolean
  trigger(feedback: HapticFeedback): void
}

const patterns: Record<HapticFeedback, number | number[]> = {
  light: 18,
  medium: 32,
  release: [18, 35, 18],
  success: [28, 45, 28, 45, 55],
}

export class WebHaptics implements HapticsPort {
  isSupported() {
    return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function'
  }

  trigger(feedback: HapticFeedback) {
    if (!this.isSupported()) return

    try {
      navigator.vibrate(patterns[feedback])
    } catch {
      // Haptics are optional feedback; training must continue if the platform rejects it.
    }
  }
}

export const haptics = new WebHaptics()

