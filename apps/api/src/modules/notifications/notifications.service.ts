import { Injectable, Logger } from '@nestjs/common';
import { NotificationsRepository } from './notifications.repository';
import { v4 as uuid } from 'uuid';

export type NotificationType =
  | 'a1_alert'
  | 'sla_warning'
  | 'lot_status_change'
  | 'prelot_assigned'
  | 'prelot_collected'
  | 'transport_job_assigned'
  | 'collection_job_assigned'
  | 'weight_mismatch'
  | 'tolerance_exceeded';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly notificationsRepository: NotificationsRepository) {}

  async send(data: {
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    payload?: Record<string, unknown>;
  }) {
    const notification = await this.notificationsRepository.create({
      id: uuid(),
      userId: data.userId,
      type: data.type,
      title: data.title,
      body: data.body,
      payload: data.payload,
      sentAt: new Date(),
    });
    this.logger.log(`Notification sent [${data.type}] to user ${data.userId}: ${data.title}`);
    return notification;
  }

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
