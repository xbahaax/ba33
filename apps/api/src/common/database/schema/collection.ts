import {
  pgTable,
  uuid,
  text,
  timestamp,
  decimal,
  integer,
  jsonb,
  boolean,
  date,
} from 'drizzle-orm/pg-core';
import { preLotStatusEnum, routeStatusEnum, routeStopStatusEnum, bagTypeEnum } from './enums';
import { sources } from './sources';
import { users } from './users';
import { regions } from './regions';

export const collectors = pgTable('collectors', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => users.id),
  assignedRegions: jsonb('assigned_regions').$type<string[]>(),
  certifications: jsonb('certifications'),
  active: boolean('active').default(true),
});

export const collectorBooklets = pgTable('collector_booklets', {
  id: uuid('id').primaryKey().defaultRandom(),
  collectorId: uuid('collector_id')
    .notNull()
    .references(() => collectors.userId),
  serialStart: text('serial_start'),
  serialEnd: text('serial_end'),
  issuedAt: timestamp('issued_at', { withTimezone: true }),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  revokedReason: text('revoked_reason'),
});

export const preLots = pgTable('pre_lots', {
  id: uuid('id').primaryKey().defaultRandom(),
  sourceId: uuid('source_id')
    .notNull()
    .references(() => sources.id),
  estimatedWeightKg: decimal('estimated_weight_kg', { precision: 10, scale: 2 }).notNull(),
  estimatedRange: text('estimated_range'),
  locationLat: decimal('location_lat', { precision: 10, scale: 7 }),
  locationLng: decimal('location_lng', { precision: 10, scale: 7 }),
  regionId: uuid('region_id').references(() => regions.id),
  notes: text('notes'),
  voiceNoteId: uuid('voice_note_id'), // FK to files — plain uuid to avoid circular imports
  status: preLotStatusEnum('status').default('announced'),
  assignedCollectorId: uuid('assigned_collector_id').references(() => collectors.userId),
  scheduledAt: timestamp('scheduled_at', { withTimezone: true }),
  lotId: uuid('lot_id'), // FK to lots — set when collected, plain uuid to avoid circular imports

  // ── Stage 1 — Laine de tonte (C1) declaration fields ────────────────────
  shearingDate: date('shearing_date'),
  sheepBreed: text('sheep_breed'),
  bagCount: integer('bag_count'),
  bagType: bagTypeEnum('bag_type'),
  lastParasiteTreatmentDate: date('last_parasite_treatment_date'),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const routes = pgTable('routes', {
  id: uuid('id').primaryKey().defaultRandom(),
  collectorId: uuid('collector_id')
    .notNull()
    .references(() => collectors.userId),
  date: timestamp('date', { withTimezone: true }),
  status: routeStatusEnum('status').default('planned'),
  totalPlannedKg: decimal('total_planned_kg', { precision: 10, scale: 2 }),
  totalActualKg: decimal('total_actual_kg', { precision: 10, scale: 2 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const routeStops = pgTable('route_stops', {
  id: uuid('id').primaryKey().defaultRandom(),
  routeId: uuid('route_id')
    .notNull()
    .references(() => routes.id),
  preLotId: uuid('pre_lot_id').references(() => preLots.id),
  sourceId: uuid('source_id').references(() => sources.id),
  order: integer('order').notNull(),
  status: routeStopStatusEnum('status').default('pending'),
  arrivalTime: timestamp('arrival_time', { withTimezone: true }),
});
