import { pgTable, uuid, text, timestamp, decimal, boolean, jsonb, primaryKey } from 'drizzle-orm/pg-core';
import { transportLaneEnum, jobStatusEnum } from './enums';
import { users } from './users';
import { lots } from './lots';

export const transporters = pgTable('transporters', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => users.id),
  vehicleInfo: jsonb('vehicle_info'),
  certifications: jsonb('certifications'),
  active: boolean('active').default(true).notNull(),
});

export const transportJobs = pgTable('transport_jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  transporterId: uuid('transporter_id').references(() => transporters.userId),
  originType: text('origin_type').notNull(),
  originId: uuid('origin_id').notNull(),
  destinationType: text('destination_type').notNull(),
  destinationId: uuid('destination_id').notNull(),
  lane: transportLaneEnum('lane').notNull(),
  status: jobStatusEnum('status').default('pending').notNull(),
  slaDeadline: timestamp('sla_deadline', { withTimezone: true }),
  requestedAt: timestamp('requested_at', { withTimezone: true }).notNull(),
  acceptedAt: timestamp('accepted_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const transportJobLots = pgTable(
  'transport_job_lots',
  {
    jobId: uuid('job_id')
      .notNull()
      .references(() => transportJobs.id),
    lotId: uuid('lot_id')
      .notNull()
      .references(() => lots.id),
    loadedWeightKg: decimal('loaded_weight_kg', { precision: 10, scale: 2 }),
    deliveredWeightKg: decimal('delivered_weight_kg', { precision: 10, scale: 2 }),
    loadedAt: timestamp('loaded_at', { withTimezone: true }),
    deliveredAt: timestamp('delivered_at', { withTimezone: true }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.jobId, table.lotId] }),
  }),
);

export const transportGpsPoints = pgTable('transport_gps_points', {
  id: uuid('id').primaryKey().defaultRandom(),
  jobId: uuid('job_id')
    .notNull()
    .references(() => transportJobs.id),
  lat: decimal('lat', { precision: 10, scale: 7 }).notNull(),
  lng: decimal('lng', { precision: 10, scale: 7 }).notNull(),
  temperatureC: decimal('temperature_c', { precision: 5, scale: 2 }),
  recordedAt: timestamp('recorded_at', { withTimezone: true }).notNull(),
});
