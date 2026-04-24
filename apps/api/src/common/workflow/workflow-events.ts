import { createHash } from 'node:crypto';
import { and, eq, sql } from 'drizzle-orm';
import { events } from '../database/schema';

type WorkflowEventInput = {
  aggregateId: string;
  aggregateType: string;
  actorId: string | null;
  actorType: string;
  eventType: string;
  occurredAt?: Date;
  payload?: Record<string, unknown>;
};

export async function appendWorkflowEvent(db: any, input: WorkflowEventInput) {
  const occurredAt = input.occurredAt ?? new Date();
  const [versionRow] = await db
    .select({
      version: sql<number>`coalesce(max(${events.version}), 0)::int`,
    })
    .from(events)
    .where(
      and(
        eq(events.aggregateType, input.aggregateType),
        eq(events.aggregateId, input.aggregateId),
      ),
    );

  const version = (versionRow?.version ?? 0) + 1;
  const checksum = createHash('sha1')
    .update(
      JSON.stringify({
        aggregateId: input.aggregateId,
        aggregateType: input.aggregateType,
        actorId: input.actorId,
        actorType: input.actorType,
        eventType: input.eventType,
        occurredAt: occurredAt.toISOString(),
        payload: input.payload ?? {},
        version,
      }),
    )
    .digest('hex');

  await db.insert(events).values({
    aggregateId: input.aggregateId,
    aggregateType: input.aggregateType,
    actorId: input.actorId,
    actorType: input.actorType,
    checksum,
    eventType: input.eventType,
    occurredAt,
    payload: input.payload ?? {},
    version,
  });
}
