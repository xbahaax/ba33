import { pgTable, uuid, text, timestamp, jsonb, boolean, decimal } from 'drizzle-orm/pg-core';
import { auditTypeEnum } from './enums';
import { users } from './users';

export const audits = pgTable('audits', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: auditTypeEnum('type').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: uuid('entity_id').notNull(),
  actorId: uuid('actor_id').references(() => users.id),
  actorIp: text('actor_ip'),
  actorUserAgent: text('actor_user_agent'),
  oldValues: jsonb('old_values'),
  newValues: jsonb('new_values'),
  diff: jsonb('diff'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const reconciliations = pgTable('reconciliations', {
  id: uuid('id').primaryKey().defaultRandom(),
  entityType: text('entity_type').notNull(),
  entityId: uuid('entity_id').notNull(),
  expectedValue: decimal('expected_value', { precision: 12, scale: 4 }),
  actualValue: decimal('actual_value', { precision: 12, scale: 4 }),
  discrepancy: decimal('discrepancy', { precision: 12, scale: 4 }),
  unit: text('unit'),
  resolved: boolean('resolved').default(false).notNull(),
  resolvedBy: uuid('resolved_by').references(() => users.id),
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
  notes: text('notes'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
