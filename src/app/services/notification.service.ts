import { Injectable, signal } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private notifications = signal<Notification[]>([]);
  
  notifications$ = this.notifications.asReadonly();

  private generateId(): string {
    return `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  show(type: NotificationType, title: string, message: string, duration: number = 5000) {
    const notification: Notification = {
      id: this.generateId(),
      type,
      title,
      message,
      duration,
      timestamp: Date.now()
    };

    this.notifications.update(notifs => [...notifs, notification]);

    if (duration > 0) {
      setTimeout(() => {
        this.remove(notification.id);
      }, duration);
    }

    return notification.id;
  }

  success(title: string, message: string = '', duration?: number) {
    return this.show('success', title, message, duration);
  }

  error(title: string, message: string = '', duration?: number) {
    return this.show('error', title, message, duration || 7000);
  }

  warning(title: string, message: string = '', duration?: number) {
    return this.show('warning', title, message, duration);
  }

  info(title: string, message: string = '', duration?: number) {
    return this.show('info', title, message, duration);
  }

  remove(id: string) {
    this.notifications.update(notifs => notifs.filter(n => n.id !== id));
  }

  clear() {
    this.notifications.set([]);
  }
}

