import { pgTable, uuid, text, timestamp, decimal, boolean, jsonb, integer } from 'drizzle-orm/pg-core';
import {
  preWashActionEnum,
  gradeEnum,
  safetyStatusEnum,
  dispatchTrackEnum,
  conditioningStateEnum,
} from './enums';
import { regions } from './regions';
import { users } from './users';
import { lots } from './lots';
import { depotDispatches } from './depot';

export const laveries = pgTable('laveries', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
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

export const laverieReceptions = pgTable('laverie_receptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  laverieId: uuid('laverie_id')
    .notNull()
    .references(() => laveries.id),
  lotId: uuid('lot_id')
    .notNull()
    .references(() => lots.id),
  depotDispatchId: uuid('depot_dispatch_id').references(() => depotDispatches.id),
  receivedWeightKg: decimal('received_weight_kg', { precision: 10, scale: 2 }).notNull(),
  receivedBy: uuid('received_by')
    .notNull()
    .references(() => users.id),
  receivedAt: timestamp('received_at', { withTimezone: true }).notNull(),

  // ── Stage 5 — Entrée laverie ─────────────────────────────────────────────
  conditioningState: conditioningStateEnum('conditioning_state'), // correct | torn | humid
  requiredWashTempC: decimal('required_wash_temp_c', { precision: 5, scale: 2 }),
  requiredDetergentType: text('required_detergent_type'),
});

export const preWashChecks = pgTable('pre_wash_checks', {
  id: uuid('id').primaryKey().defaultRandom(),
  lotId: uuid('lot_id')
    .notNull()
    .references(() => lots.id),
  vetCertReference: text('vet_cert_reference'),
  visualInspectionPassed: boolean('visual_inspection_passed').notNull(),
  contaminationDetected: boolean('contamination_detected').notNull(),
  action: preWashActionEnum('action').notNull(),
  performedBy: uuid('performed_by')
    .notNull()
    .references(() => users.id),
  performedAt: timestamp('performed_at', { withTimezone: true }).notNull(),
});

export const washingRuns = pgTable('washing_runs', {
  id: uuid('id').primaryKey().defaultRandom(),
  laverieId: uuid('laverie_id')
    .notNull()
    .references(() => laveries.id),
  lotId: uuid('lot_id')
    .notNull()
    .references(() => lots.id),
  dirtyWeightKg: decimal('dirty_weight_kg', { precision: 10, scale: 2 }).notNull(),
  cleanWeightKg: decimal('clean_weight_kg', { precision: 10, scale: 2 }),
  yieldPercent: decimal('yield_percent', { precision: 5, scale: 2 }),
  waterLiters: decimal('water_liters', { precision: 10, scale: 2 }),
  chemicals: jsonb('chemicals'),
  cycleDurationMinutes: integer('cycle_duration_minutes'),
  waterTempC: decimal('water_temp_c', { precision: 5, scale: 2 }),
  detergentType: text('detergent_type'),
  suintRecoveredLiters: decimal('suint_recovered_liters', { precision: 10, scale: 2 }),
  startedAt: timestamp('started_at', { withTimezone: true }).notNull(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  operatedBy: uuid('operated_by')
    .notNull()
    .references(() => users.id),
});

export const qualifications = pgTable('qualifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  lotId: uuid('lot_id')
    .notNull()
    .references(() => lots.id),
  washingRunId: uuid('washing_run_id')
    .notNull()
    .references(() => washingRuns.id),
  fiberLengthMm: decimal('fiber_length_mm', { precision: 7, scale: 2 }),
  fiberDiameterMicron: decimal('fiber_diameter_micron', { precision: 7, scale: 2 }),
  moisturePercent: decimal('moisture_percent', { precision: 5, scale: 2 }),
  cleanlinessScore: integer('cleanliness_score'),
  color: text('color'),
  grade: gradeEnum('grade').notNull(),
  safetyStatus: safetyStatusEnum('safety_status').notNull(),
  contaminationNotes: text('contamination_notes'),

  // ── Stage 7 — Sortie laverie / Certificat de pureté ──────────────────────
  residualHumidityPercent: decimal('residual_humidity_percent', { precision: 5, scale: 2 }), // target 12–15%
  residualSuintPercent: decimal('residual_suint_percent', { precision: 5, scale: 2 }),       // target < 1%
  whitenessIndex: decimal('whiteness_index', { precision: 7, scale: 2 }),
  phLevel: decimal('ph_level', { precision: 4, scale: 2 }),
  energyKwhUsed: decimal('energy_kwh_used', { precision: 10, scale: 2 }),
  waterLitersPerKg: decimal('water_liters_per_kg', { precision: 7, scale: 3 }),

  performedBy: uuid('performed_by')
    .notNull()
    .references(() => users.id),
  performedAt: timestamp('performed_at', { withTimezone: true }).notNull(),
});

export const pricingProposals = pgTable('pricing_proposals', {
  id: uuid('id').primaryKey().defaultRandom(),
  lotId: uuid('lot_id')
    .notNull()
    .references(() => lots.id),
  qualificationId: uuid('qualification_id')
    .notNull()
    .references(() => qualifications.id),
  basePricePerKg: decimal('base_price_per_kg', { precision: 10, scale: 2 }).notNull(),
  urgencyDiscountPercent: decimal('urgency_discount_percent', { precision: 5, scale: 2 }).notNull(),
  sourceTypeAdjustmentPercent: decimal('source_type_adjustment_percent', { precision: 5, scale: 2 }).notNull(),
  finalPricePerKg: decimal('final_price_per_kg', { precision: 10, scale: 2 }).notNull(),
  totalValue: decimal('total_value', { precision: 12, scale: 2 }).notNull(),
  computedAt: timestamp('computed_at', { withTimezone: true }).notNull(),
});

export const laverieDispatches = pgTable('laverie_dispatches', {
  id: uuid('id').primaryKey().defaultRandom(),
  lotId: uuid('lot_id')
    .notNull()
    .references(() => lots.id),
  qualificationId: uuid('qualification_id')
    .notNull()
    .references(() => qualifications.id),
  track: dispatchTrackEnum('track').notNull(),
  targetTransformerId: uuid('target_transformer_id'),
  ruleVersion: integer('rule_version').notNull(),
  dispatchedBy: uuid('dispatched_by').references(() => users.id),
  dispatchedAt: timestamp('dispatched_at', { withTimezone: true }).notNull(),
});
