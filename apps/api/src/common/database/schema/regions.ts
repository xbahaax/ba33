import { pgTable, uuid, text, timestamp, decimal } from 'drizzle-orm/pg-core';
import { regionTypeEnum } from './enums';

export const regions = pgTable('regions', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  code: text('code').unique().notNull(),
  parentId: uuid('parent_id').references((): any => regions.id),
  type: regionTypeEnum('type').notNull(),
  latitude: decimal('latitude', { precision: 10, scale: 7 }),
  longitude: decimal('longitude', { precision: 10, scale: 7 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
