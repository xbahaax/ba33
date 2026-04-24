import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_TOKEN } from '../../common/database/database.module';
import type { Database } from '../../common/database/client';

@Injectable()
export class EventsRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async create(data: {
    id: string;
    eventType: string;
    aggregateType: string;
    aggregateId: string;
    actorId?: string;
    actorType: string;
    payload?: unknown;
    occurredAt: Date;
    recordedAt: Date;
    syncSource?: string;
    deviceId?: string;
    version: number;
    checksum: string;
  }) {
    const [event] = await this.db.insert(events).values(data).returning();
    return event;
  }

  async findByAggregate(aggregateType: string, aggregateId: string) {
    return this.db
      .select()
      .from(events)
      .where(
        and(
          eq(events.aggregateType, aggregateType),
          eq(events.aggregateId, aggregateId),
        ),
      )
      .orderBy(desc(events.occurredAt));
  }

  async findByType(eventType: string, from?: Date, to?: Date) {
    const conditions = [eq(events.eventType, eventType)];

    if (from) {
      conditions.push(gte(events.occurredAt, from));
    }
    if (to) {
      conditions.push(lte(events.occurredAt, to));
    }

    return this.db
      .select()
      .from(events)
      .where(and(...conditions))
      .orderBy(desc(events.occurredAt));
  }

  async findSince(recordedAt: Date) {
    return this.db
      .select()
      .from(events)
      .where(gte(events.recordedAt, recordedAt))
      .orderBy(desc(events.recordedAt));
  }
}
