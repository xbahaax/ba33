import { Inject, Injectable } from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';
import { DATABASE_TOKEN } from '../../common/database/database.module';
import type { Database } from '../../common/database/client';
import { events, users } from '../../common/database/schema';

@Injectable()
export class EventsRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async getRecent() {
    return this.db
      .select({
        id: events.id,
        eventType: events.eventType,
        aggregateType: events.aggregateType,
        aggregateId: events.aggregateId,
        actorType: events.actorType,
        actorName: users.fullName,
        occurredAt: events.occurredAt,
        recordedAt: events.recordedAt,
      })
      .from(events)
      .leftJoin(users, eq(events.actorId, users.id))
      .orderBy(desc(events.occurredAt))
      .limit(10);
  }
}
