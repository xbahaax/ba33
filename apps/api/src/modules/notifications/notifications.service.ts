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
  | 'weight_mismatch'
  | 'tolerance_exceeded';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly notificationsRepository: NotificationsRepository,
  ) {}

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

    this.logger.log(
      `Notification sent [${data.type}] to user ${data.userId}: ${data.title}`,
    );

    return notification;
  }

  async sendToMany(
    userIds: string[],
    data: {
      type: NotificationType;
      title: string;
      body: string;
      payload?: Record<string, unknown>;
    },
  ) {
    const results = await Promise.all(
      userIds.map((userId) => this.send({ userId, ...data })),
    );
    return results;
  }

  async getUserNotifications(userId: string, unreadOnly?: boolean) {
    return this.notificationsRepository.findByUserId(userId, unreadOnly);
  }

  async markAsRead(notificationId: string) {
    return this.notificationsRepository.markAsRead(notificationId);
  }

  async markAllAsRead(userId: string) {
    return this.notificationsRepository.markAllAsRead(userId);
  }
}
