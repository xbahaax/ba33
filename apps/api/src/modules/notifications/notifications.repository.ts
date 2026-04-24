import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_TOKEN } from '../../common/database/database.module';
import type { Database } from '../../common/database/client';
import { notifications } from '../../common/database/schema';
import { eq, and, isNull, desc } from 'drizzle-orm';

@Injectable()
export class NotificationsRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

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

  async findById(id: string) {
    const [notification] = await this.db
      .select()
      .from(notifications)
      .where(eq(notifications.id, id))
      .limit(1);
    return notification ?? null;
  }

  async findByUserId(userId: string, unreadOnly?: boolean) {
    const conditions = [eq(notifications.userId, userId)];
    if (unreadOnly) {
      conditions.push(isNull(notifications.readAt));
    }
    return this.db
      .select()
      .from(notifications)
      .where(and(...conditions))
      .orderBy(desc(notifications.createdAt));
  }

  async markAsRead(id: string) {
    const [notification] = await this.db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(eq(notifications.id, id))
      .returning();
    return notification;
  }

  async markAllAsRead(userId: string) {
    return this.db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(
        and(eq(notifications.userId, userId), isNull(notifications.readAt)),
      );
  }
}
