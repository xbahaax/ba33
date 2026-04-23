import { pgTable, uuid, text, timestamp, jsonb, integer } from 'drizzle-orm/pg-core';
import { users } from './users';

export const rulesConfig = pgTable('rules_config', {
  id: uuid('id').primaryKey().defaultRandom(),
  ruleKey: text('rule_key').notNull(),
  value: jsonb('value').notNull(),
  description: text('description'),
  version: integer('version'),
  effectiveFrom: timestamp('effective_from', { withTimezone: true }).notNull(),
  effectiveTo: timestamp('effective_to', { withTimezone: true }),
  createdBy: uuid('created_by')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
