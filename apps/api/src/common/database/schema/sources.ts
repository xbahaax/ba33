import { pgTable, uuid, text, timestamp, decimal, integer, jsonb, boolean } from 'drizzle-orm/pg-core';
import { sourceTypeEnum, sourceStatusEnum } from './enums';
import { regions } from './regions';
import { users } from './users';

export const sources = pgTable('sources', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  type: sourceTypeEnum('type').notNull(),
  status: sourceStatusEnum('status').default('prospecting').notNull(),
  address: text('address'),
  latitude: decimal('latitude', { precision: 10, scale: 7 }),
  longitude: decimal('longitude', { precision: 10, scale: 7 }),
  regionId: uuid('region_id').references(() => regions.id),
  contactName: text('contact_name'),
  contactPhone: text('contact_phone'),
  contactEmail: text('contact_email'),
  estimatedVolumeLiters: decimal('estimated_volume_liters', { precision: 10, scale: 2 }),
  contractRef: text('contract_ref'),
  notes: text('notes'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const shepherds = pgTable('shepherds', {
  sourceId: uuid('source_id')
    .primaryKey()
    .references(() => sources.id),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  herdSize: integer('herd_size'),
  milkTypical: decimal('milk_typical', { precision: 10, scale: 2 }),
  feedType: text('feed_type'),
  veterinaryContact: text('veterinary_contact'),
  lastInspectionAt: timestamp('last_inspection_at', { withTimezone: true }),
  certified: boolean('certified').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const slaughterhouses = pgTable('slaughterhouses', {
  id: uuid('id').primaryKey().defaultRandom(),
  sourceId: uuid('source_id')
    .notNull()
    .references(() => sources.id),
  licenseNumber: text('license_number').notNull(),
  capacityKgPerDay: decimal('capacity_kg_per_day', { precision: 10, scale: 2 }),
  inspectorName: text('inspector_name'),
  lastAuditAt: timestamp('last_audit_at', { withTimezone: true }),
  halal: boolean('halal').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const aggregators = pgTable('aggregators', {
  id: uuid('id').primaryKey().defaultRandom(),
  sourceId: uuid('source_id')
    .notNull()
    .references(() => sources.id),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  coverageRegionId: uuid('coverage_region_id').references(() => regions.id),
  numberOfSources: integer('number_of_sources').default(0).notNull(),
  commission: decimal('commission', { precision: 5, scale: 2 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
