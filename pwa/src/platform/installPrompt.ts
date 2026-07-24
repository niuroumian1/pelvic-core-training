interface InstallChoice {
  outcome: 'accepted' | 'dismissed'
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<InstallChoice>
}

type InstallListener = (canInstall: boolean) => void

export class PwaInstallService {
  private promptEvent: BeforeInstallPromptEvent | null = null
  private listeners = new Set<InstallListener>()

  constructor() {
    if (typeof window === 'undefined') return

    window.addEventListener('beforeinstallprompt', this.capturePrompt as EventListener)
    window.addEventListener('appinstalled', this.handleInstalled)
  }

  canInstall = () => this.promptEvent !== null

  subscribe = (listener: InstallListener) => {
    this.listeners.add(listener)
    listener(this.canInstall())
    return () => {
      this.listeners.delete(listener)
    }
  }

  promptInstall = async () => {
    if (!this.promptEvent) return false

    const event = this.promptEvent
    await event.prompt()
    const choice = await event.userChoice

    if (choice.outcome === 'accepted') {
      this.promptEvent = null
      this.notify()
      return true
    }

    return false
  }

  private capturePrompt = (event: BeforeInstallPromptEvent) => {
    event.preventDefault()
    this.promptEvent = event
    this.notify()
  }

  private handleInstalled = () => {
    this.promptEvent = null
    this.notify()
  }

  private notify() {
    const canInstall = this.canInstall()
    this.listeners.forEach((listener) => listener(canInstall))
  }
}

export const installService = new PwaInstallService()
