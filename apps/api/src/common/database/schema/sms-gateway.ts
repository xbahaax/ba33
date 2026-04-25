import {
  boolean,
  decimal,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { sources } from './sources';

export const smsMessages = pgTable('sms_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  providerMessageId: text('provider_message_id'),
  senderPhone: text('sender_phone').notNull(),
  sourceId: uuid('source_id').references(() => sources.id),
  messageText: text('message_text').notNull(),
  normalizedText: text('normalized_text').notNull(),
  parsedPayload: jsonb('parsed_payload'),
  latitude: decimal('latitude', { precision: 10, scale: 7 }),
  longitude: decimal('longitude', { precision: 10, scale: 7 }),
  geolocationPrecisionMeters: integer('geolocation_precision_meters'),
  geolocationProvided: boolean('geolocation_provided').default(false).notNull(),
  sourceMatched: boolean('source_matched').default(false).notNull(),
  processedAt: timestamp('processed_at', { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
