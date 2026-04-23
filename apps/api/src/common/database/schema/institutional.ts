import { pgTable, uuid, text, timestamp, jsonb, boolean } from 'drizzle-orm/pg-core';
import { institutionalQueryTypeEnum } from './enums';
import { users } from './users';

export const institutionalUsers = pgTable('institutional_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  organization: text('organization').notNull(),
  department: text('department'),
  position: text('position'),
  accessLevel: text('access_level').default('read').notNull(),
  allowedRegions: jsonb('allowed_regions'),
  allowedDataTypes: jsonb('allowed_data_types'),
  active: boolean('active').default(true).notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const institutionalQueries = pgTable('institutional_queries', {
  id: uuid('id').primaryKey().defaultRandom(),
  institutionalUserId: uuid('institutional_user_id')
    .notNull()
    .references(() => institutionalUsers.id),
  type: institutionalQueryTypeEnum('type').notNull(),
  query: jsonb('query').notNull(),
  resultSummary: text('result_summary'),
  resultUrl: text('result_url'),
  executedAt: timestamp('executed_at', { withTimezone: true }).defaultNow().notNull(),
  durationMs: timestamp('duration_ms', { withTimezone: true }),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
