import { pgTable, uuid, text, timestamp, decimal, integer, jsonb, boolean } from 'drizzle-orm/pg-core';
import { gradeEnum, safetyStatusEnum, preWashActionEnum } from './enums';
import { regions } from './regions';
import { users } from './users';
import { lots } from './lots';

export const laveries = pgTable('laveries', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  code: text('code').notNull().unique(),
  address: text('address'),
  latitude: decimal('latitude', { precision: 10, scale: 7 }),
  longitude: decimal('longitude', { precision: 10, scale: 7 }),
  regionId: uuid('region_id').references(() => regions.id),
  managerId: uuid('manager_id').references(() => users.id),
  capacityKgPerDay: decimal('capacity_kg_per_day', { precision: 12, scale: 2 }),
  active: boolean('active').default(true).notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const laverieReceptions = pgTable('laverie_receptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  laverieId: uuid('laverie_id')
    .notNull()
    .references(() => laveries.id),
  lotId: uuid('lot_id')
    .notNull()
    .references(() => lots.id),
  receivedBy: uuid('received_by').references(() => users.id),
  weightAtReception: decimal('weight_at_reception', { precision: 10, scale: 2 }),
  temperatureAtReception: decimal('temperature_at_reception', { precision: 5, scale: 2 }),
  visualInspection: text('visual_inspection'),
  accepted: boolean('accepted').default(true).notNull(),
  rejectionReason: text('rejection_reason'),
  notes: text('notes'),
  receivedAt: timestamp('received_at', { withTimezone: true }).defaultNow().notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const preWashChecks = pgTable('pre_wash_checks', {
  id: uuid('id').primaryKey().defaultRandom(),
  lotId: uuid('lot_id')
    .notNull()
    .references(() => lots.id),
  laverieId: uuid('laverie_id')
    .notNull()
    .references(() => laveries.id),
  checkedBy: uuid('checked_by').references(() => users.id),
  action: preWashActionEnum('action').notNull(),
  contaminantFound: text('contaminant_found'),
  phLevel: decimal('ph_level', { precision: 4, scale: 2 }),
  temperature: decimal('temperature', { precision: 5, scale: 2 }),
  notes: text('notes'),
  metadata: jsonb('metadata'),
  checkedAt: timestamp('checked_at', { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const washingRuns = pgTable('washing_runs', {
  id: uuid('id').primaryKey().defaultRandom(),
  lotId: uuid('lot_id')
    .notNull()
    .references(() => lots.id),
  laverieId: uuid('laverie_id')
    .notNull()
    .references(() => laveries.id),
  operatorId: uuid('operator_id').references(() => users.id),
  machineId: text('machine_id'),
  program: text('program'),
  temperatureCelsius: decimal('temperature_celsius', { precision: 5, scale: 2 }),
  durationMinutes: integer('duration_minutes'),
  chemicalsUsed: jsonb('chemicals_used'),
  waterVolumeLiters: decimal('water_volume_liters', { precision: 10, scale: 2 }),
  weightBeforeKg: decimal('weight_before_kg', { precision: 10, scale: 2 }),
  weightAfterKg: decimal('weight_after_kg', { precision: 10, scale: 2 }),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  notes: text('notes'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const qualifications = pgTable('qualifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  lotId: uuid('lot_id')
    .notNull()
    .references(() => lots.id),
  laverieId: uuid('laverie_id')
    .notNull()
    .references(() => laveries.id),
  qualifiedBy: uuid('qualified_by').references(() => users.id),
  grade: gradeEnum('grade').notNull(),
  fatContent: decimal('fat_content', { precision: 5, scale: 2 }),
  acidityLevel: decimal('acidity_level', { precision: 5, scale: 2 }),
  moisturePercent: decimal('moisture_percent', { precision: 5, scale: 2 }),
  impurityPercent: decimal('impurity_percent', { precision: 5, scale: 2 }),
  color: text('color'),
  odor: text('odor'),
  texture: text('texture'),
  safetyStatus: safetyStatusEnum('safety_status').default('pending').notNull(),
  labReportUrl: text('lab_report_url'),
  notes: text('notes'),
  metadata: jsonb('metadata'),
  qualifiedAt: timestamp('qualified_at', { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const pricingProposals = pgTable('pricing_proposals', {
  id: uuid('id').primaryKey().defaultRandom(),
  lotId: uuid('lot_id')
    .notNull()
    .references(() => lots.id),
  laverieId: uuid('laverie_id')
    .notNull()
    .references(() => laveries.id),
  proposedBy: uuid('proposed_by').references(() => users.id),
  priceMadPerKg: decimal('price_mad_per_kg', { precision: 10, scale: 2 }).notNull(),
  totalPriceMad: decimal('total_price_mad', { precision: 12, scale: 2 }),
  accepted: boolean('accepted'),
  acceptedAt: timestamp('accepted_at', { withTimezone: true }),
  rejectedReason: text('rejected_reason'),
  notes: text('notes'),
  metadata: jsonb('metadata'),
  proposedAt: timestamp('proposed_at', { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const laverieDispatches = pgTable('laverie_dispatches', {
  id: uuid('id').primaryKey().defaultRandom(),
  laverieId: uuid('laverie_id')
    .notNull()
    .references(() => laveries.id),
  lotId: uuid('lot_id')
    .notNull()
    .references(() => lots.id),
  dispatchedBy: uuid('dispatched_by').references(() => users.id),
  destinationType: text('destination_type').notNull(),
  destinationId: uuid('destination_id').notNull(),
  weightKg: decimal('weight_kg', { precision: 10, scale: 2 }),
  dispatchedAt: timestamp('dispatched_at', { withTimezone: true }).defaultNow().notNull(),
  notes: text('notes'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
