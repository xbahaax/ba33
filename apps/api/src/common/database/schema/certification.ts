import { pgTable, uuid, text, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { certStatusEnum } from './enums';
import { users } from './users';
import { products } from './transformation';

export const certifications = pgTable('certifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id),
  productCode: text('product_code').notNull(),
  status: certStatusEnum('status').default('pending').notNull(),
  gatesPassed: jsonb('gates_passed'),
  signature: text('signature'),
  issuedBy: uuid('issued_by').references(() => users.id),
  issuedAt: timestamp('issued_at', { withTimezone: true }),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  revokedReason: text('revoked_reason'),
  qrCodeUrl: text('qr_code_url').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
