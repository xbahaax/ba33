import { pgTable, uuid, text, timestamp, decimal, boolean, jsonb, integer, primaryKey } from 'drizzle-orm/pg-core';
import {
  transformerTrackEnum,
  productStatusEnum,
  wasteCategoryEnum,
  productDestinationTypeEnum,
  unloadingModeEnum,
  antimitesTreatmentTypeEnum,
} from './enums';
import { regions } from './regions';
import { users } from './users';
import { lots } from './lots';

export const transformers = pgTable('transformers', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  track: transformerTrackEnum('track').notNull(),
  regionId: uuid('region_id')
    .notNull()
    .references(() => regions.id),
  address: text('address').notNull(),
  dailyCapacityKg: decimal('daily_capacity_kg', { precision: 10, scale: 2 }).notNull(),
  managerId: uuid('manager_id').references(() => users.id),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const boms = pgTable('boms', {
  id: uuid('id').primaryKey().defaultRandom(),
  transformerId: uuid('transformer_id')
    .notNull()
    .references(() => transformers.id),
  productTypeCode: text('product_type_code').notNull(),
  productName: text('product_name').notNull(),
  inputWoolKgPerUnit: decimal('input_wool_kg_per_unit', { precision: 10, scale: 4 }).notNull(),
  additives: jsonb('additives'),
  expectedYieldPercent: decimal('expected_yield_percent', { precision: 5, scale: 2 }).notNull(),
  version: integer('version').notNull(),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const productionRuns = pgTable('production_runs', {
  id: uuid('id').primaryKey().defaultRandom(),
  transformerId: uuid('transformer_id')
    .notNull()
    .references(() => transformers.id),
  bomId: uuid('bom_id')
    .notNull()
    .references(() => boms.id),
  bomVersion: integer('bom_version').notNull(),
  inputWeightKg: decimal('input_weight_kg', { precision: 10, scale: 2 }).notNull(),
  outputWeightKg: decimal('output_weight_kg', { precision: 10, scale: 2 }),
  wasteWeightKg: decimal('waste_weight_kg', { precision: 10, scale: 2 }),
  yieldPercent: decimal('yield_percent', { precision: 5, scale: 2 }),
  startedAt: timestamp('started_at', { withTimezone: true }).notNull(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  operatedBy: uuid('operated_by')
    .notNull()
    .references(() => users.id),

  // ── Stage 6 — Entrée Transformateur 2 (Engrais direct) ───────────────────
  drynessIndex: decimal('dryness_index', { precision: 5, scale: 2 }),
  foreignBodyPresent: boolean('foreign_body_present'),
  foreignBodyNotes: text('foreign_body_notes'),
  unloadingMode: unloadingModeEnum('unloading_mode'),

  // ── Stage 8 — Entrée Transformateur 1 (Isolants/Géotextiles) ─────────────
  productDestinationType: productDestinationTypeEnum('product_destination_type'),
  targetThicknessMm: decimal('target_thickness_mm', { precision: 7, scale: 2 }),
  targetDensityKgM3: decimal('target_density_kg_m3', { precision: 7, scale: 3 }),
  antimitesTreatmentType: antimitesTreatmentTypeEnum('antimites_treatment_type'),
  bindingFiberPercent: decimal('binding_fiber_percent', { precision: 5, scale: 2 }),
  fireRetardantProduct: text('fire_retardant_product'),
});

export const productionRunLots = pgTable(
  'production_run_lots',
  {
    runId: uuid('run_id')
      .notNull()
      .references(() => productionRuns.id),
    lotId: uuid('lot_id')
      .notNull()
      .references(() => lots.id),
    weightUsedKg: decimal('weight_used_kg', { precision: 10, scale: 2 }).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.runId, table.lotId] }),
  }),
);

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  productionRunId: uuid('production_run_id')
    .notNull()
    .references(() => productionRuns.id),
  productCode: text('product_code').notNull().unique(),
  productTypeCode: text('product_type_code').notNull(),
  track: transformerTrackEnum('track').notNull(),
  quantity: decimal('quantity', { precision: 10, scale: 2 }).notNull(),
  unit: text('unit').notNull(),
  weightKg: decimal('weight_kg', { precision: 10, scale: 2 }).notNull(),
  status: productStatusEnum('status').default('in_production').notNull(),
  certificationId: uuid('certification_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const wasteRecords = pgTable('waste_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  productionRunId: uuid('production_run_id').references(() => productionRuns.id),
  washingRunId: uuid('washing_run_id'),
  amountKg: decimal('amount_kg', { precision: 10, scale: 2 }).notNull(),
  category: wasteCategoryEnum('category').notNull(),
  destination: text('destination'),
  recordedBy: uuid('recorded_by')
    .notNull()
    .references(() => users.id),
  recordedAt: timestamp('recorded_at', { withTimezone: true }).notNull(),
});
