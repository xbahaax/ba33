import { pgTable, uuid, text, timestamp, jsonb, integer, boolean } from 'drizzle-orm/pg-core';
import { users } from './users';

export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventType: text('event_type').notNull(),
  aggregateType: text('aggregate_type').notNull(),
  aggregateId: uuid('aggregate_id').notNull(),
  actorId: uuid('actor_id').references(() => users.id),
  actorType: text('actor_type').notNull(),
  payload: jsonb('payload'),
  occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull(),
  recordedAt: timestamp('recorded_at', { withTimezone: true }).defaultNow().notNull(),
  syncSource: text('sync_source'),
  deviceId: uuid('device_id'),
  version: integer('version').notNull(),
  checksum: text('checksum').notNull(),
});

export const eventSubscriptions = pgTable('event_subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventTypePattern: text('event_type_pattern').notNull(),
  handlerName: text('handler_name').notNull(),
  active: boolean('active').default(true).notNull(),
});
