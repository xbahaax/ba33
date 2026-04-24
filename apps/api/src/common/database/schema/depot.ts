import { pgTable, uuid, text, timestamp, decimal, boolean, jsonb, primaryKey, integer, date } from 'drizzle-orm/pg-core';
import { depotZonePurposeEnum, a1SeverityEnum, a1StatusEnum, lotClassificationEnum, depotDestinationDirectEnum } from './enums';
import { regions } from './regions';
import { users } from './users';
import { lots } from './lots';
import { transportJobs } from './transport';

export const depots = pgTable('depots', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  regionId: uuid('region_id')
    .notNull()
    .references(() => regions.id),
  address: text('address').notNull(),
  capacityKg: decimal('capacity_kg', { precision: 10, scale: 2 }).notNull(),
  currentWeightKg: decimal('current_weight_kg', { precision: 10, scale: 2 }).notNull(),
  managerId: uuid('manager_id').references(() => users.id),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const depotZones = pgTable('depot_zones', {
  id: uuid('id').primaryKey().defaultRandom(),
  depotId: uuid('depot_id')
    .notNull()
    .references(() => depots.id),
  code: text('code').notNull(),
  purpose: depotZonePurposeEnum('purpose').notNull(),
  capacityKg: decimal('capacity_kg', { precision: 10, scale: 2 }).notNull(),
  currentWeightKg: decimal('current_weight_kg', { precision: 10, scale: 2 }).notNull(),
});

export const depotReceptions = pgTable('depot_receptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  depotId: uuid('depot_id')
    .notNull()
    .references(() => depots.id),
  lotId: uuid('lot_id')
    .notNull()
    .references(() => lots.id),
  declaredWeightKg: decimal('declared_weight_kg', { precision: 10, scale: 2 }).notNull(),
  actualWeightKg: decimal('actual_weight_kg', { precision: 10, scale: 2 }).notNull(),
  discrepancyKg: decimal('discrepancy_kg', { precision: 10, scale: 2 }).notNull(),
  toleranceExceeded: boolean('tolerance_exceeded').notNull(),
  zoneId: uuid('zone_id').references(() => depotZones.id),
  receivedBy: uuid('received_by')
    .notNull()
    .references(() => users.id),
  receivedAt: timestamp('received_at', { withTimezone: true }).notNull(),
  notes: text('notes'),

  // ── Stage 3 — Dépositaire tri fields ─────────────────────────────────────
  lotClassification: lotClassificationEnum('lot_classification'),  // Classe A | B
  stackTemperatureC: decimal('stack_temperature_c', { precision: 5, scale: 2 }),
  humidityEntryPercent: decimal('humidity_entry_percent', { precision: 5, scale: 2 }),
  vegetalMatterPercent: decimal('vegetal_matter_percent', { precision: 5, scale: 2 }), // VM%
  plannedExitDate: date('planned_exit_date'),
});

export const depotDispatches = pgTable('depot_dispatches', {
  id: uuid('id').primaryKey().defaultRandom(),
  depotId: uuid('depot_id')
    .notNull()
    .references(() => depots.id),
  destinationLaverieId: uuid('destination_laverie_id'),         // nullable: either laverie or transformer
  destinationTransformerId: uuid('destination_transformer_id'), // for direct Flux B route
  manifestWeightKg: decimal('manifest_weight_kg', { precision: 10, scale: 2 }).notNull(),
  dispatchedBy: uuid('dispatched_by')
    .notNull()
    .references(() => users.id),
  dispatchedAt: timestamp('dispatched_at', { withTimezone: true }).notNull(),
  transportJobId: uuid('transport_job_id').references(() => transportJobs.id),

  // ── Stage 4 — Sortie dépositaire fields ──────────────────────────────────
  fluxAWeightKg: decimal('flux_a_weight_kg', { precision: 10, scale: 2 }),   // Isolation volume
  fluxBWeightKg: decimal('flux_b_weight_kg', { precision: 10, scale: 2 }),   // Engrais volume
  impurityRatePercent: decimal('impurity_rate_percent', { precision: 5, scale: 2 }), // VM%
  humidityExitPercent: decimal('humidity_exit_percent', { precision: 5, scale: 2 }), // H%
  destinationDirect: depotDestinationDirectEnum('destination_direct'),
});

export const depotDispatchLots = pgTable(
  'depot_dispatch_lots',
  {
    dispatchId: uuid('dispatch_id')
      .notNull()
      .references(() => depotDispatches.id),
    lotId: uuid('lot_id')
      .notNull()
      .references(() => lots.id),
    weightKg: decimal('weight_kg', { precision: 10, scale: 2 }).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.dispatchId, table.lotId] }),
  }),
);

export const a1Alerts = pgTable('a1_alerts', {
  id: uuid('id').primaryKey().defaultRandom(),
  depotId: uuid('depot_id')
    .notNull()
    .references(() => depots.id),
  triggerCondition: jsonb('trigger_condition').notNull(),
  severity: a1SeverityEnum('severity').notNull(),
  status: a1StatusEnum('status').default('open').notNull(),
  firedAt: timestamp('fired_at', { withTimezone: true }).notNull(),
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
});
