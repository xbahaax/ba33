import {
  pgTable,
  uuid,
  text,
  timestamp,
  decimal,
  boolean,
  unique,
} from 'drizzle-orm/pg-core';
import {
  sourceTypeEnum,
  lotStateQuickEnum,
  urgencyLevelEnum,
  lotStatusEnum,
  lotPhotoAngleEnum,
  signatureTypeEnum,
  lotLineageOperationEnum,
  weighSourceEnum,
} from './enums';
import { sources } from './sources';
import { users } from './users';

export const lots = pgTable('lots', {
  id: uuid('id').primaryKey().defaultRandom(),
  sourceId: uuid('source_id')
    .notNull()
    .references(() => sources.id),
  sourceType: sourceTypeEnum('source_type'),
  collectorId: uuid('collector_id'), // FK to collectors.userId — plain uuid to avoid circular imports
  qrCode: text('qr_code').unique().notNull(),
  declaredWeightKg: decimal('declared_weight_kg', { precision: 10, scale: 2 }),
  actualWeightKg: decimal('actual_weight_kg', { precision: 10, scale: 2 }),
  stateQuick: lotStateQuickEnum('state_quick'),
  urgency: urgencyLevelEnum('urgency').default('normal'),
  coldChainTempC: decimal('cold_chain_temp_c', { precision: 5, scale: 2 }),
  gpsLat: decimal('gps_lat', { precision: 10, scale: 7 }),
  gpsLng: decimal('gps_lng', { precision: 10, scale: 7 }),
  status: lotStatusEnum('status').notNull(),
  isUrgent: boolean('is_urgent').default(false),
  collectedAt: timestamp('collected_at', { withTimezone: true }),
  preLotId: uuid('pre_lot_id'),
  routeStopId: uuid('route_stop_id'),
  currentLocationId: uuid('current_location_id'),
  currentLocationType: text('current_location_type'),
  notes: text('notes'),
  voiceNoteId: uuid('voice_note_id'), // FK to files
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const lotPhotos = pgTable('lot_photos', {
  id: uuid('id').primaryKey().defaultRandom(),
  lotId: uuid('lot_id')
    .notNull()
    .references(() => lots.id),
  fileId: uuid('file_id').notNull(), // FK to files
  angle: lotPhotoAngleEnum('angle'),
  capturedAt: timestamp('captured_at', { withTimezone: true }),
  gpsLat: decimal('gps_lat', { precision: 10, scale: 7 }),
  gpsLng: decimal('gps_lng', { precision: 10, scale: 7 }),
});

export const lotSignatures = pgTable('lot_signatures', {
  id: uuid('id').primaryKey().defaultRandom(),
  lotId: uuid('lot_id')
    .notNull()
    .references(() => lots.id),
  type: signatureTypeEnum('type'),
  fileId: uuid('file_id').notNull(), // FK to files
  signedByName: text('signed_by_name'),
  capturedAt: timestamp('captured_at', { withTimezone: true }),
});

export const lotLineage = pgTable(
  'lot_lineage',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    childLotId: uuid('child_lot_id')
      .notNull()
      .references(() => lots.id),
    parentLotId: uuid('parent_lot_id')
      .notNull()
      .references(() => lots.id),
    weightContributionKg: decimal('weight_contribution_kg', { precision: 10, scale: 2 }),
    operation: lotLineageOperationEnum('operation'),
    performedBy: uuid('performed_by').references(() => users.id),
    performedAt: timestamp('performed_at', { withTimezone: true }),
    notes: text('notes'),
  },
  (table) => ({
    uniqueChildParent: unique().on(table.childLotId, table.parentLotId),
  }),
);

export const lotWeighs = pgTable('lot_weighs', {
  id: uuid('id').primaryKey().defaultRandom(),
  lotId: uuid('lot_id')
    .notNull()
    .references(() => lots.id),
  phase: text('phase').notNull(),
  weightKg: decimal('weight_kg', { precision: 10, scale: 2 }).notNull(),
  source: weighSourceEnum('source'),
  recordedBy: uuid('recorded_by').references(() => users.id),
  recordedAt: timestamp('recorded_at', { withTimezone: true }),
  eventId: uuid('event_id'),
});
