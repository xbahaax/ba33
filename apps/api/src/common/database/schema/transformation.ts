import { pgTable, uuid, text, timestamp, decimal, integer, jsonb, boolean } from 'drizzle-orm/pg-core';
import { transformerTrackEnum, productStatusEnum, wasteCategoryEnum } from './enums';
import { regions } from './regions';
import { users } from './users';
import { lots } from './lots';

export const transformers = pgTable('transformers', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  code: text('code').notNull().unique(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  address: text('address'),
  latitude: decimal('latitude', { precision: 10, scale: 7 }),
  longitude: decimal('longitude', { precision: 10, scale: 7 }),
  regionId: uuid('region_id').references(() => regions.id),
  capacityKgPerDay: decimal('capacity_kg_per_day', { precision: 12, scale: 2 }),
  specializations: jsonb('specializations'),
  active: boolean('active').default(true).notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const boms = pgTable('boms', {
  id: uuid('id').primaryKey().defaultRandom(),
  transformerId: uuid('transformer_id')
    .notNull()
    .references(() => transformers.id),
  name: text('name').notNull(),
  outputProduct: text('output_product').notNull(),
  inputRatio: decimal('input_ratio', { precision: 5, scale: 4 }),
  outputRatio: decimal('output_ratio', { precision: 5, scale: 4 }),
  wasteRatio: decimal('waste_ratio', { precision: 5, scale: 4 }),
  instructions: text('instructions'),
  active: boolean('active').default(true).notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const productionRuns = pgTable('production_runs', {
  id: uuid('id').primaryKey().defaultRandom(),
  transformerId: uuid('transformer_id')
    .notNull()
    .references(() => transformers.id),
  bomId: uuid('bom_id').references(() => boms.id),
  status: transformerTrackEnum('status').default('received').notNull(),
  operatorId: uuid('operator_id').references(() => users.id),
  batchCode: text('batch_code').notNull().unique(),
  inputWeightKg: decimal('input_weight_kg', { precision: 10, scale: 2 }),
  outputWeightKg: decimal('output_weight_kg', { precision: 10, scale: 2 }),
  wasteWeightKg: decimal('waste_weight_kg', { precision: 10, scale: 2 }),
  yieldPercent: decimal('yield_percent', { precision: 5, scale: 2 }),
  temperatureCelsius: decimal('temperature_celsius', { precision: 5, scale: 2 }),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  notes: text('notes'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const productionRunLots = pgTable('production_run_lots', {
  id: uuid('id').primaryKey().defaultRandom(),
  productionRunId: uuid('production_run_id')
    .notNull()
    .references(() => productionRuns.id),
  lotId: uuid('lot_id')
    .notNull()
    .references(() => lots.id),
  role: text('role').notNull().default('input'),
  weightKg: decimal('weight_kg', { precision: 10, scale: 2 }),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  productionRunId: uuid('production_run_id')
    .notNull()
    .references(() => productionRuns.id),
  lotId: uuid('lot_id').references(() => lots.id),
  name: text('name').notNull(),
  sku: text('sku').unique(),
  status: productStatusEnum('status').default('in_stock').notNull(),
  weightKg: decimal('weight_kg', { precision: 10, scale: 2 }),
  unitPrice: decimal('unit_price', { precision: 10, scale: 2 }),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  batchCode: text('batch_code'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const wasteRecords = pgTable('waste_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  productionRunId: uuid('production_run_id').references(() => productionRuns.id),
  transformerId: uuid('transformer_id')
    .notNull()
    .references(() => transformers.id),
  category: wasteCategoryEnum('category').notNull(),
  weightKg: decimal('weight_kg', { precision: 10, scale: 2 }).notNull(),
  disposalMethod: text('disposal_method'),
  disposedBy: uuid('disposed_by').references(() => users.id),
  disposedAt: timestamp('disposed_at', { withTimezone: true }),
  notes: text('notes'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
