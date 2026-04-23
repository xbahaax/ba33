import { pgTable, uuid, text, timestamp, jsonb, integer } from 'drizzle-orm/pg-core';
import { syncDirectionEnum, syncBatchStatusEnum } from './enums';
import { users } from './users';

export const syncDevices = pgTable('sync_devices', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  deviceId: uuid('device_id').notNull().unique(),
  deviceInfo: jsonb('device_info').notNull(),
  lastSyncAt: timestamp('last_sync_at', { withTimezone: true }),
  namespacePrefix: text('namespace_prefix').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const syncBatches = pgTable('sync_batches', {
  id: uuid('id').primaryKey().defaultRandom(),
  deviceId: uuid('device_id')
    .notNull()
    .references(() => syncDevices.id),
  direction: syncDirectionEnum('direction').notNull(),
  eventCount: integer('event_count').notNull(),
  status: syncBatchStatusEnum('status').default('pending').notNull(),
  error: text('error'),
  startedAt: timestamp('started_at', { withTimezone: true }).notNull(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
});
