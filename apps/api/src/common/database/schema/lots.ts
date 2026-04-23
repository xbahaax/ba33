import { pgTable, uuid, text, timestamp, decimal, integer, jsonb, boolean } from 'drizzle-orm/pg-core';
import {
  lotStatusEnum,
  lotStateQuickEnum,
  gradeEnum,
  lotPhotoAngleEnum,
  signatureTypeEnum,
  weighSourceEnum,
  lotLineageOperationEnum,
} from './enums';
import { regions } from './regions';
import { users } from './users';
import { sources } from './sources';
import { collectors } from './collection';

export const lots = pgTable('lots', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').notNull().unique(),
  sourceId: uuid('source_id').references(() => sources.id),
  collectorId: uuid('collector_id').references(() => collectors.id),
  regionId: uuid('region_id').references(() => regions.id),
  status: lotStatusEnum('status').default('collected').notNull(),
  stateQuick: lotStateQuickEnum('state_quick').default('raw').notNull(),
  grade: gradeEnum('grade'),
  weightKg: decimal('weight_kg', { precision: 10, scale: 2 }),
  volumeLiters: decimal('volume_liters', { precision: 10, scale: 2 }),
  fatContent: decimal('fat_content', { precision: 5, scale: 2 }),
  acidityLevel: decimal('acidity_level', { precision: 5, scale: 2 }),
  moisturePercent: decimal('moisture_percent', { precision: 5, scale: 2 }),
  impurityPercent: decimal('impurity_percent', { precision: 5, scale: 2 }),
  temperature: decimal('temperature', { precision: 5, scale: 2 }),
  color: text('color'),
  odor: text('odor'),
  texture: text('texture'),
  priceMad: decimal('price_mad', { precision: 10, scale: 2 }),
  collectedAt: timestamp('collected_at', { withTimezone: true }),
  receivedAt: timestamp('received_at', { withTimezone: true }),
  processedAt: timestamp('processed_at', { withTimezone: true }),
  certifiedAt: timestamp('certified_at', { withTimezone: true }),
  soldAt: timestamp('sold_at', { withTimezone: true }),
  qrCode: text('qr_code'),
  barcode: text('barcode'),
  blockchainTxHash: text('blockchain_tx_hash'),
  parentLotId: uuid('parent_lot_id'),
  isMerged: boolean('is_merged').default(false).notNull(),
  mergedFromCount: integer('merged_from_count').default(0).notNull(),
  notes: text('notes'),
  metadata: jsonb('metadata'),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const lotPhotos = pgTable('lot_photos', {
  id: uuid('id').primaryKey().defaultRandom(),
  lotId: uuid('lot_id')
    .notNull()
    .references(() => lots.id),
  angle: lotPhotoAngleEnum('angle').notNull(),
  fileUrl: text('file_url').notNull(),
  fileSize: integer('file_size'),
  mimeType: text('mime_type'),
  takenAt: timestamp('taken_at', { withTimezone: true }),
  latitude: decimal('latitude', { precision: 10, scale: 7 }),
  longitude: decimal('longitude', { precision: 10, scale: 7 }),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const lotSignatures = pgTable('lot_signatures', {
  id: uuid('id').primaryKey().defaultRandom(),
  lotId: uuid('lot_id')
    .notNull()
    .references(() => lots.id),
  type: signatureTypeEnum('type').notNull(),
  signedBy: uuid('signed_by').references(() => users.id),
  signedByName: text('signed_by_name'),
  signatureUrl: text('signature_url').notNull(),
  signedAt: timestamp('signed_at', { withTimezone: true }).defaultNow().notNull(),
  latitude: decimal('latitude', { precision: 10, scale: 7 }),
  longitude: decimal('longitude', { precision: 10, scale: 7 }),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const lotLineage = pgTable('lot_lineage', {
  id: uuid('id').primaryKey().defaultRandom(),
  parentLotId: uuid('parent_lot_id')
    .notNull()
    .references(() => lots.id),
  childLotId: uuid('child_lot_id')
    .notNull()
    .references(() => lots.id),
  operation: lotLineageOperationEnum('operation').notNull(),
  ratio: decimal('ratio', { precision: 5, scale: 4 }),
  performedBy: uuid('performed_by').references(() => users.id),
  notes: text('notes'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const lotWeighs = pgTable('lot_weighs', {
  id: uuid('id').primaryKey().defaultRandom(),
  lotId: uuid('lot_id')
    .notNull()
    .references(() => lots.id),
  weightKg: decimal('weight_kg', { precision: 10, scale: 2 }).notNull(),
  source: weighSourceEnum('source').notNull(),
  scaleId: text('scale_id'),
  weighedBy: uuid('weighed_by').references(() => users.id),
  weighedAt: timestamp('weighed_at', { withTimezone: true }).defaultNow().notNull(),
  latitude: decimal('latitude', { precision: 10, scale: 7 }),
  longitude: decimal('longitude', { precision: 10, scale: 7 }),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
