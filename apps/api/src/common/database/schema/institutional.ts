import { pgTable, uuid, text, timestamp, boolean, jsonb, integer } from 'drizzle-orm/pg-core';
import { institutionalQueryTypeEnum } from './enums';
import { users } from './users';

export const institutionalUsers = pgTable('institutional_users', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => users.id),
  institutionName: text('institution_name').notNull(),
  mandate: jsonb('mandate').notNull(),
  active: boolean('active').default(true).notNull(),
});

export const institutionalQueries = pgTable('institutional_queries', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  queryType: institutionalQueryTypeEnum('query_type').notNull(),
  queryParams: jsonb('query_params').notNull(),
  resultCount: integer('result_count').notNull(),
  justification: text('justification'),
  performedAt: timestamp('performed_at', { withTimezone: true }).notNull(),
});
