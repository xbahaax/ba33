import { pgTable, uuid, text, timestamp, decimal, boolean, jsonb } from 'drizzle-orm/pg-core';
import { auditTypeEnum } from './enums';
import { users } from './users';
import { lots } from './lots';

export const audits = pgTable('audits', {
  id: uuid('id').primaryKey().defaultRandom(),
  auditType: auditTypeEnum('audit_type').notNull(),
  subjectType: text('subject_type').notNull(),
  subjectId: uuid('subject_id').notNull(),
  findings: jsonb('findings').notNull(),
  passed: boolean('passed').notNull(),
  auditorId: uuid('auditor_id')
    .notNull()
    .references(() => users.id),
  performedAt: timestamp('performed_at', { withTimezone: true }).notNull(),
});

export const reconciliations = pgTable('reconciliations', {
  id: uuid('id').primaryKey().defaultRandom(),
  lotId: uuid('lot_id')
    .notNull()
    .references(() => lots.id),
  phaseFrom: text('phase_from').notNull(),
  phaseTo: text('phase_to').notNull(),
  weightOutKg: decimal('weight_out_kg', { precision: 10, scale: 2 }).notNull(),
  weightInKg: decimal('weight_in_kg', { precision: 10, scale: 2 }).notNull(),
  deltaKg: decimal('delta_kg', { precision: 10, scale: 2 }).notNull(),
  toleranceKg: decimal('tolerance_kg', { precision: 10, scale: 2 }).notNull(),
  withinTolerance: boolean('within_tolerance').notNull(),
  flagged: boolean('flagged').notNull(),
  computedAt: timestamp('computed_at', { withTimezone: true }).notNull(),
});
