import { pgTable, uuid, text, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { certStatusEnum } from './enums';
import { users } from './users';
import { lots } from './lots';

export const certifications = pgTable('certifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  lotId: uuid('lot_id')
    .notNull()
    .references(() => lots.id),
  certifierId: uuid('certifier_id')
    .notNull()
    .references(() => users.id),
  status: certStatusEnum('status').default('pending').notNull(),
  certificateNumber: text('certificate_number').unique(),
  standard: text('standard'),
  issuedAt: timestamp('issued_at', { withTimezone: true }),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  documentUrl: text('document_url'),
  findings: text('findings'),
  conditions: text('conditions'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
