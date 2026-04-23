import { pgTable, uuid, text, timestamp, decimal, integer, jsonb, boolean } from 'drizzle-orm/pg-core';
import { preLotStatusEnum, routeStatusEnum, routeStopStatusEnum } from './enums';
import { regions } from './regions';
import { users } from './users';
import { sources } from './sources';

export const collectors = pgTable('collectors', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  regionId: uuid('region_id').references(() => regions.id),
  vehicleInfo: jsonb('vehicle_info'),
  maxCapacityKg: decimal('max_capacity_kg', { precision: 10, scale: 2 }),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const collectorBooklets = pgTable('collector_booklets', {
  id: uuid('id').primaryKey().defaultRandom(),
  collectorId: uuid('collector_id')
    .notNull()
    .references(() => collectors.id),
  bookletNumber: text('booklet_number').notNull().unique(),
  issuedAt: timestamp('issued_at', { withTimezone: true }).defaultNow().notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  totalPages: integer('total_pages').default(50).notNull(),
  usedPages: integer('used_pages').default(0).notNull(),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const preLots = pgTable('pre_lots', {
  id: uuid('id').primaryKey().defaultRandom(),
  collectorId: uuid('collector_id')
    .notNull()
    .references(() => collectors.id),
  sourceId: uuid('source_id')
    .notNull()
    .references(() => sources.id),
  bookletId: uuid('booklet_id').references(() => collectorBooklets.id),
  pageNumber: integer('page_number'),
  status: preLotStatusEnum('status').default('draft').notNull(),
  estimatedWeightKg: decimal('estimated_weight_kg', { precision: 10, scale: 2 }),
  notes: text('notes'),
  collectedAt: timestamp('collected_at', { withTimezone: true }),
  latitude: decimal('latitude', { precision: 10, scale: 7 }),
  longitude: decimal('longitude', { precision: 10, scale: 7 }),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const routes = pgTable('routes', {
  id: uuid('id').primaryKey().defaultRandom(),
  collectorId: uuid('collector_id')
    .notNull()
    .references(() => collectors.id),
  name: text('name'),
  status: routeStatusEnum('status').default('planned').notNull(),
  plannedDate: timestamp('planned_date', { withTimezone: true }).notNull(),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  totalDistanceKm: decimal('total_distance_km', { precision: 10, scale: 2 }),
  regionId: uuid('region_id').references(() => regions.id),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const routeStops = pgTable('route_stops', {
  id: uuid('id').primaryKey().defaultRandom(),
  routeId: uuid('route_id')
    .notNull()
    .references(() => routes.id),
  sourceId: uuid('source_id')
    .notNull()
    .references(() => sources.id),
  stopOrder: integer('stop_order').notNull(),
  status: routeStopStatusEnum('status').default('pending').notNull(),
  scheduledArrival: timestamp('scheduled_arrival', { withTimezone: true }),
  actualArrival: timestamp('actual_arrival', { withTimezone: true }),
  departedAt: timestamp('departed_at', { withTimezone: true }),
  preLotId: uuid('pre_lot_id').references(() => preLots.id),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
