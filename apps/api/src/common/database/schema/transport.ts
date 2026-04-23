import { pgTable, uuid, text, timestamp, decimal, integer, jsonb, boolean } from 'drizzle-orm/pg-core';
import { transportLaneEnum, jobStatusEnum } from './enums';
import { regions } from './regions';
import { users } from './users';
import { lots } from './lots';

export const transporters = pgTable('transporters', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  companyName: text('company_name'),
  licenseNumber: text('license_number'),
  vehiclePlate: text('vehicle_plate'),
  vehicleType: text('vehicle_type'),
  maxCapacityKg: decimal('max_capacity_kg', { precision: 10, scale: 2 }),
  refrigerated: boolean('refrigerated').default(false).notNull(),
  regionId: uuid('region_id').references(() => regions.id),
  active: boolean('active').default(true).notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const transportJobs = pgTable('transport_jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  transporterId: uuid('transporter_id')
    .notNull()
    .references(() => transporters.id),
  lane: transportLaneEnum('lane').notNull(),
  status: jobStatusEnum('status').default('pending').notNull(),
  originType: text('origin_type').notNull(),
  originId: uuid('origin_id').notNull(),
  destinationType: text('destination_type').notNull(),
  destinationId: uuid('destination_id').notNull(),
  scheduledPickupAt: timestamp('scheduled_pickup_at', { withTimezone: true }),
  actualPickupAt: timestamp('actual_pickup_at', { withTimezone: true }),
  scheduledDeliveryAt: timestamp('scheduled_delivery_at', { withTimezone: true }),
  actualDeliveryAt: timestamp('actual_delivery_at', { withTimezone: true }),
  totalWeightKg: decimal('total_weight_kg', { precision: 10, scale: 2 }),
  distanceKm: decimal('distance_km', { precision: 10, scale: 2 }),
  temperatureMin: decimal('temperature_min', { precision: 5, scale: 2 }),
  temperatureMax: decimal('temperature_max', { precision: 5, scale: 2 }),
  notes: text('notes'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const transportJobLots = pgTable('transport_job_lots', {
  id: uuid('id').primaryKey().defaultRandom(),
  jobId: uuid('job_id')
    .notNull()
    .references(() => transportJobs.id),
  lotId: uuid('lot_id')
    .notNull()
    .references(() => lots.id),
  weightKg: decimal('weight_kg', { precision: 10, scale: 2 }),
  temperatureAtPickup: decimal('temperature_at_pickup', { precision: 5, scale: 2 }),
  temperatureAtDelivery: decimal('temperature_at_delivery', { precision: 5, scale: 2 }),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const transportGpsPoints = pgTable('transport_gps_points', {
  id: uuid('id').primaryKey().defaultRandom(),
  jobId: uuid('job_id')
    .notNull()
    .references(() => transportJobs.id),
  latitude: decimal('latitude', { precision: 10, scale: 7 }).notNull(),
  longitude: decimal('longitude', { precision: 10, scale: 7 }).notNull(),
  altitude: decimal('altitude', { precision: 8, scale: 2 }),
  speed: decimal('speed', { precision: 6, scale: 2 }),
  heading: decimal('heading', { precision: 5, scale: 2 }),
  accuracy: decimal('accuracy', { precision: 6, scale: 2 }),
  temperature: decimal('temperature', { precision: 5, scale: 2 }),
  recordedAt: timestamp('recorded_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
