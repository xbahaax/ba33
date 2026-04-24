import { Injectable } from '@nestjs/common';
import { NotificationsRepository } from './notifications.repository';

@Injectable()
export class NotificationsService {
  constructor(private readonly notificationsRepository: NotificationsRepository) {}

  list() {
    return this.notificationsRepository.list();
  }

  markAllRead() {
    return this.notificationsRepository.markAllRead();
  }

  dismiss(notificationId: string) {
    return this.notificationsRepository.dismiss(notificationId);
  }
}
