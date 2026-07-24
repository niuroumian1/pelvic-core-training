export interface TrainingNotification {
  title: string
  body: string
  tag?: string
}

export interface NotificationPort {
  isSupported(): boolean
  getPermission(): NotificationPermission | 'unsupported'
  requestPermission(): Promise<NotificationPermission | 'unsupported'>
  show(notification: TrainingNotification): Promise<boolean>
}

export class WebNotificationService implements NotificationPort {
  isSupported() {
    return typeof Notification !== 'undefined'
  }

  getPermission() {
    return this.isSupported() ? Notification.permission : 'unsupported'
  }

  async requestPermission() {
    if (!this.isSupported()) return 'unsupported'
    return Notification.requestPermission()
  }

  async show(notification: TrainingNotification) {
    if (!this.isSupported() || Notification.permission !== 'granted') return false

    new Notification(notification.title, {
      body: notification.body,
      tag: notification.tag,
      icon: `/${appConfig.iconPath}`,
    })
    return true
  }
}

export const notificationService = new WebNotificationService()
import { appConfig } from '../config/appConfig'

