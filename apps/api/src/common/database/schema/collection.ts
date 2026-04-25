import {
  pgTable,
  uuid,
  text,
  timestamp,
  decimal,
  integer,
  jsonb,
  boolean,
  index,
} from 'drizzle-orm/pg-core';
import {
  preLotStatusEnum,
  routeStatusEnum,
  routeStopStatusEnum,
  collectionJobStatusEnum,
  urgencyLevelEnum,
} from './enums';
import { sources } from './sources';
import { users } from './users';
import { regions } from './regions';
import { depots } from './depot';

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

// ── Collection Jobs ────────────────────────────────────────────
// Issued by a depot/admin once a source has declared wool. Drives the
// collector app: instruction queue → accept → start → GPS-tracked travel →
// arrival form → lot creation. This is the new two-actor model replacing
// the routes/booklets autonomous-planning flow.

export const collectionJobs = pgTable(
  'collection_jobs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    preLotId: uuid('pre_lot_id')
      .notNull()
      .references(() => preLots.id),
    sourceId: uuid('source_id')
      .notNull()
      .references(() => sources.id),
    destinationDepotId: uuid('destination_depot_id')
      .notNull()
      .references(() => depots.id),
    collectorId: uuid('collector_id').references(() => collectors.userId),
    urgency: urgencyLevelEnum('urgency').default('normal').notNull(),
    status: collectionJobStatusEnum('status').default('pending').notNull(),
    originLat: decimal('origin_lat', { precision: 10, scale: 7 }),
    originLng: decimal('origin_lng', { precision: 10, scale: 7 }),
    destinationLat: decimal('destination_lat', { precision: 10, scale: 7 }),
    destinationLng: decimal('destination_lng', { precision: 10, scale: 7 }),
    slaDeadline: timestamp('sla_deadline', { withTimezone: true }),
    notes: text('notes'),
    issuedBy: uuid('issued_by').references(() => users.id),
    issuedAt: timestamp('issued_at', { withTimezone: true }).defaultNow().notNull(),
    assignedAt: timestamp('assigned_at', { withTimezone: true }),
    acceptedAt: timestamp('accepted_at', { withTimezone: true }),
    startedAt: timestamp('started_at', { withTimezone: true }),
    arrivedAt: timestamp('arrived_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
    cancelReason: text('cancel_reason'),
    lotId: uuid('lot_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    statusIdx: index('collection_jobs_status_idx').on(table.status),
    collectorIdx: index('collection_jobs_collector_idx').on(table.collectorId),
    depotIdx: index('collection_jobs_depot_idx').on(table.destinationDepotId),
  }),
);

export const collectionJobGpsPoints = pgTable(
  'collection_job_gps_points',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    jobId: uuid('job_id')
      .notNull()
      .references(() => collectionJobs.id, { onDelete: 'cascade' }),
    lat: decimal('lat', { precision: 10, scale: 7 }).notNull(),
    lng: decimal('lng', { precision: 10, scale: 7 }).notNull(),
    speedMps: decimal('speed_mps', { precision: 8, scale: 3 }),
    accuracy: decimal('accuracy', { precision: 8, scale: 3 }),
    recordedAt: timestamp('recorded_at', { withTimezone: true }).notNull(),
  },
  (table) => ({
    jobRecordedIdx: index('collection_job_gps_job_recorded_idx').on(
      table.jobId,
      table.recordedAt,
    ),
  }),
);
