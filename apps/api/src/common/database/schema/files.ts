import { pgTable, uuid, text, timestamp, integer, jsonb } from 'drizzle-orm/pg-core';
import { fileKindEnum } from './enums';
import { users } from './users';

export const files = pgTable('files', {
  id: uuid('id').primaryKey().defaultRandom(),
  kind: fileKindEnum('kind').notNull(),
  mimeType: text('mime_type').notNull(),
  storagePath: text('storage_path').notNull(),
  sizeBytes: integer('size_bytes').notNull(),
  uploadedBy: uuid('uploaded_by').references(() => users.id),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
