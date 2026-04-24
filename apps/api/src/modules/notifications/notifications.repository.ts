import { Inject, Injectable } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DATABASE_TOKEN } from '../../common/database/database.module';
import type { Database } from '../../common/database/client';
import { notifications } from '../../common/database/schema';

export interface BuyerNotification {
  id: string;
  type: 'order' | 'delivery' | 'certificate' | 'complaint';
  title: string;
  description: string;
  time: string;
  read: boolean;
}

@Injectable()
export class NotificationsRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async list(userId: string): Promise<BuyerNotification[]> {
    const rows = await this.db.select().from(notifications).where(eq(notifications.userId, userId));
    return rows.map((row) => ({
      id: row.id,
      type: row.type as BuyerNotification['type'],
      title: row.title,
      description: row.body,
      time: row.createdAt.toLocaleDateString('fr-FR'),
      read: Boolean(row.readAt),
    }));
  }

  async markAllRead(userId: string): Promise<BuyerNotification[]> {
    await this.db.update(notifications).set({ readAt: new Date() }).where(eq(notifications.userId, userId));
    return this.list(userId);
  }

  async dismiss(userId: string, notificationId: string): Promise<{ deleted: boolean }> {
    const deleted = await this.db
      .delete(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.id, notificationId)))
      .returning();

    return { deleted: deleted.length > 0 };
  }

  async create(data: {
    id: string;
    userId: string;
    type: string;
    title: string;
    body: string;
    payload?: unknown;
    sentAt?: Date;
  }) {
    const [notification] = await this.db
      .insert(notifications)
      .values(data)
      .returning();
    return notification;
  }
}
