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
