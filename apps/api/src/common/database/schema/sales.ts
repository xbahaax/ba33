import { pgTable, uuid, text, timestamp, decimal, jsonb } from 'drizzle-orm/pg-core';
import {
  channelEnum,
  orderStatusEnum,
  paymentStatusEnum,
  shipmentStatusEnum,
  salesDocTypeEnum,
} from './enums';
import { users } from './users';

export const buyers = pgTable('buyers', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => users.id),
  companyName: text('company_name').notNull(),
  registrationNumber: text('registration_number'),
  preferredChannel: channelEnum('preferred_channel').notNull(),
  creditLimit: decimal('credit_limit', { precision: 12, scale: 2 }),
  billingAddress: jsonb('billing_address').notNull(),
  shippingAddresses: jsonb('shipping_addresses').notNull(),
});

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  buyerId: uuid('buyer_id')
    .notNull()
    .references(() => buyers.userId),
  channel: channelEnum('channel').notNull(),
  status: orderStatusEnum('status').default('draft').notNull(),
  paymentStatus: paymentStatusEnum('payment_status').default('pending').notNull(),
  subtotal: decimal('subtotal', { precision: 12, scale: 2 }).notNull(),
  tax: decimal('tax', { precision: 12, scale: 2 }).notNull(),
  total: decimal('total', { precision: 12, scale: 2 }).notNull(),
  currency: text('currency').default('DZD').notNull(),
  quotedAt: timestamp('quoted_at', { withTimezone: true }),
  confirmedAt: timestamp('confirmed_at', { withTimezone: true }),
  deliveredAt: timestamp('delivered_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id),
  productId: uuid('product_id').notNull(),
  productCode: text('product_code').notNull(),
  quantity: decimal('quantity', { precision: 10, scale: 2 }).notNull(),
  unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
  subtotal: decimal('subtotal', { precision: 12, scale: 2 }).notNull(),
});

export const shipments = pgTable('shipments', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id),
  status: shipmentStatusEnum('status').default('pending').notNull(),
  trackingReference: text('tracking_reference'),
  shippedAt: timestamp('shipped_at', { withTimezone: true }),
  deliveredAt: timestamp('delivered_at', { withTimezone: true }),
});

export const salesDocuments = pgTable('sales_documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id),
  type: salesDocTypeEnum('type').notNull(),
  fileId: uuid('file_id').notNull(),
  generatedAt: timestamp('generated_at', { withTimezone: true }).notNull(),
});
