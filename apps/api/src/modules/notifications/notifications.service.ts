import { Injectable } from '@nestjs/common';
import { NotificationsRepository } from './notifications.repository';

@Injectable()
export class NotificationsService {
  constructor(private readonly notificationsRepository: NotificationsRepository) {}

  list(userId: string) {
    return this.notificationsRepository.list(userId);
  }

  markAllRead(userId: string) {
    return this.notificationsRepository.markAllRead(userId);
  }

  dismiss(userId: string, notificationId: string) {
    return this.notificationsRepository.dismiss(userId, notificationId);
  }
}
