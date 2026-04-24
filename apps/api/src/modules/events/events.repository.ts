import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, gte } from 'drizzle-orm';
import { DATABASE_TOKEN } from '../../common/database/database.module';
import type { Database } from '../../common/database/client';
import { events, users } from '../../common/database/schema';

@Injectable()
export class EventsRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async create(data: typeof events.$inferInsert) {
    const [row] = await this.db.insert(events).values(data).returning();
    return row;
  }

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

  async findByAggregate(aggregateType: string, aggregateId: string) {
    return this.db
      .select({
        id: events.id,
        eventType: events.eventType,
        aggregateType: events.aggregateType,
        aggregateId: events.aggregateId,
        actorType: events.actorType,
        actorName: users.fullName,
        payload: events.payload,
        occurredAt: events.occurredAt,
        recordedAt: events.recordedAt,
      })
      .from(events)
      .leftJoin(users, eq(events.actorId, users.id))
      .where(
        and(
          eq(events.aggregateType, aggregateType),
          eq(events.aggregateId, aggregateId),
        ),
      )
      .orderBy(desc(events.occurredAt));
  }

  async findSince(recordedAt: Date) {
    return this.db
      .select({
        id: events.id,
        eventType: events.eventType,
        aggregateType: events.aggregateType,
        aggregateId: events.aggregateId,
        actorType: events.actorType,
        payload: events.payload,
        occurredAt: events.occurredAt,
        recordedAt: events.recordedAt,
      })
      .from(events)
      .where(gte(events.recordedAt, recordedAt))
      .orderBy(events.recordedAt)
      .limit(500);
  }
}
