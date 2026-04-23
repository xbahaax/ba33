import {
  pgTable,
  uuid,
  text,
  timestamp,
  decimal,
  integer,
  boolean,
} from 'drizzle-orm/pg-core';
import { sourceTypeEnum, sourceStatusEnum } from './enums';
import { regions } from './regions';
import { users } from './users';

export const sources = pgTable('sources', {
  id: uuid('id').primaryKey().defaultRandom(),
  sourceType: sourceTypeEnum('source_type').notNull(),
  name: text('name').notNull(),
  contactPhone: text('contact_phone'),
  contactEmail: text('contact_email'),
  regionId: uuid('region_id')
    .notNull()
    .references(() => regions.id),
  latitude: decimal('latitude', { precision: 10, scale: 7 }),
  longitude: decimal('longitude', { precision: 10, scale: 7 }),
  address: text('address'),
  status: sourceStatusEnum('status').default('pending'),
  registeredBy: uuid('registered_by').references(() => users.id),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const shepherds = pgTable('shepherds', {
  sourceId: uuid('source_id')
    .primaryKey()
    .references(() => sources.id),
  hasSmartphone: boolean('has_smartphone').notNull(),
  preferredLanguage: text('preferred_language'),
  flockSizeEstimate: integer('flock_size_estimate'),
  typicalYieldKgPerYear: decimal('typical_yield_kg_per_year', { precision: 10, scale: 2 }),
});

export const slaughterhouses = pgTable('slaughterhouses', {
  sourceId: uuid('source_id')
    .primaryKey()
    .references(() => sources.id),
  licenseNumber: text('license_number').notNull(),
  dailyCapacityHeads: integer('daily_capacity_heads'),
  hasColdStorage: boolean('has_cold_storage').notNull(),
});

export const aggregators = pgTable('aggregators', {
  sourceId: uuid('source_id')
    .primaryKey()
    .references(() => sources.id),
  businessRegistration: text('business_registration').notNull(),
  registeredUpstreamCount: integer('registered_upstream_count').default(0),
  premiumCertified: boolean('premium_certified').default(false),
});
