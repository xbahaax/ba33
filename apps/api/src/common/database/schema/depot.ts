import { pgTable, uuid, text, timestamp, decimal, integer, jsonb, boolean } from 'drizzle-orm/pg-core';
import {
  depotZonePurposeEnum,
  a1SeverityEnum,
  a1StatusEnum,
  dispatchTrackEnum,
  lotStatusEnum,
} from './enums';
import { regions } from './regions';
import { users } from './users';
import { lots } from './lots';
import { transportJobs } from './transport';

export const depots = pgTable('depots', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  code: text('code').notNull().unique(),
  address: text('address'),
  latitude: decimal('latitude', { precision: 10, scale: 7 }),
  longitude: decimal('longitude', { precision: 10, scale: 7 }),
  regionId: uuid('region_id').references(() => regions.id),
  managerId: uuid('manager_id').references(() => users.id),
  capacityKg: decimal('capacity_kg', { precision: 12, scale: 2 }),
  currentLoadKg: decimal('current_load_kg', { precision: 12, scale: 2 }).default('0'),
  active: boolean('active').default(true).notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const depotZones = pgTable('depot_zones', {
  id: uuid('id').primaryKey().defaultRandom(),
  depotId: uuid('depot_id')
    .notNull()
    .references(() => depots.id),
  name: text('name').notNull(),
  purpose: depotZonePurposeEnum('purpose').notNull(),
  capacityKg: decimal('capacity_kg', { precision: 12, scale: 2 }),
  currentLoadKg: decimal('current_load_kg', { precision: 12, scale: 2 }).default('0'),
  temperatureMin: decimal('temperature_min', { precision: 5, scale: 2 }),
  temperatureMax: decimal('temperature_max', { precision: 5, scale: 2 }),
  active: boolean('active').default(true).notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const depotReceptions = pgTable('depot_receptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  depotId: uuid('depot_id')
    .notNull()
    .references(() => depots.id),
  lotId: uuid('lot_id')
    .notNull()
    .references(() => lots.id),
  transportJobId: uuid('transport_job_id').references(() => transportJobs.id),
  zoneId: uuid('zone_id').references(() => depotZones.id),
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

export const depotDispatches = pgTable('depot_dispatches', {
  id: uuid('id').primaryKey().defaultRandom(),
  depotId: uuid('depot_id')
    .notNull()
    .references(() => depots.id),
  status: dispatchTrackEnum('status').default('pending').notNull(),
  destinationType: text('destination_type').notNull(),
  destinationId: uuid('destination_id').notNull(),
  dispatchedBy: uuid('dispatched_by').references(() => users.id),
  transportJobId: uuid('transport_job_id').references(() => transportJobs.id),
  totalWeightKg: decimal('total_weight_kg', { precision: 10, scale: 2 }),
  scheduledAt: timestamp('scheduled_at', { withTimezone: true }),
  dispatchedAt: timestamp('dispatched_at', { withTimezone: true }),
  deliveredAt: timestamp('delivered_at', { withTimezone: true }),
  notes: text('notes'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const depotDispatchLots = pgTable('depot_dispatch_lots', {
  id: uuid('id').primaryKey().defaultRandom(),
  dispatchId: uuid('dispatch_id')
    .notNull()
    .references(() => depotDispatches.id),
  lotId: uuid('lot_id')
    .notNull()
    .references(() => lots.id),
  weightKg: decimal('weight_kg', { precision: 10, scale: 2 }),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const a1Alerts = pgTable('a1_alerts', {
  id: uuid('id').primaryKey().defaultRandom(),
  depotId: uuid('depot_id').references(() => depots.id),
  lotId: uuid('lot_id').references(() => lots.id),
  severity: a1SeverityEnum('severity').notNull(),
  status: a1StatusEnum('status').default('open').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  source: text('source'),
  ruleId: uuid('rule_id'),
  resolvedBy: uuid('resolved_by').references(() => users.id),
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
