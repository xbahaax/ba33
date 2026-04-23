import { pgTable, uuid, text, timestamp, decimal, integer, jsonb, boolean } from 'drizzle-orm/pg-core';
import {
  channelEnum,
  orderStatusEnum,
  paymentStatusEnum,
  shipmentStatusEnum,
  salesDocTypeEnum,
} from './enums';
import { regions } from './regions';
import { users } from './users';
import { lots } from './lots';
import { products } from './transformation';

export const buyers = pgTable('buyers', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  companyName: text('company_name'),
  channel: channelEnum('channel').notNull(),
  taxId: text('tax_id'),
  address: text('address'),
  regionId: uuid('region_id').references(() => regions.id),
  contactName: text('contact_name'),
  contactPhone: text('contact_phone'),
  contactEmail: text('contact_email'),
  creditLimitMad: decimal('credit_limit_mad', { precision: 12, scale: 2 }),
  paymentTermsDays: integer('payment_terms_days').default(30),
  active: boolean('active').default(true).notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderNumber: text('order_number').notNull().unique(),
  buyerId: uuid('buyer_id')
    .notNull()
    .references(() => buyers.id),
  status: orderStatusEnum('status').default('draft').notNull(),
  paymentStatus: paymentStatusEnum('payment_status').default('pending').notNull(),
  totalAmountMad: decimal('total_amount_mad', { precision: 12, scale: 2 }),
  taxAmountMad: decimal('tax_amount_mad', { precision: 12, scale: 2 }),
  discountAmountMad: decimal('discount_amount_mad', { precision: 12, scale: 2 }),
  netAmountMad: decimal('net_amount_mad', { precision: 12, scale: 2 }),
  currency: text('currency').default('MAD').notNull(),
  orderedAt: timestamp('ordered_at', { withTimezone: true }).defaultNow().notNull(),
  confirmedAt: timestamp('confirmed_at', { withTimezone: true }),
  deliveredAt: timestamp('delivered_at', { withTimezone: true }),
  cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
  notes: text('notes'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id),
  productId: uuid('product_id').references(() => products.id),
  lotId: uuid('lot_id').references(() => lots.id),
  description: text('description'),
  quantity: integer('quantity').notNull().default(1),
  unitPriceMad: decimal('unit_price_mad', { precision: 10, scale: 2 }).notNull(),
  totalPriceMad: decimal('total_price_mad', { precision: 12, scale: 2 }).notNull(),
  weightKg: decimal('weight_kg', { precision: 10, scale: 2 }),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const shipments = pgTable('shipments', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id),
  status: shipmentStatusEnum('status').default('pending').notNull(),
  trackingNumber: text('tracking_number'),
  carrier: text('carrier'),
  originAddress: text('origin_address'),
  destinationAddress: text('destination_address'),
  weightKg: decimal('weight_kg', { precision: 10, scale: 2 }),
  shippedAt: timestamp('shipped_at', { withTimezone: true }),
  estimatedDeliveryAt: timestamp('estimated_delivery_at', { withTimezone: true }),
  deliveredAt: timestamp('delivered_at', { withTimezone: true }),
  notes: text('notes'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const salesDocuments = pgTable('sales_documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id),
  type: salesDocTypeEnum('type').notNull(),
  documentNumber: text('document_number').notNull().unique(),
  fileUrl: text('file_url'),
  amountMad: decimal('amount_mad', { precision: 12, scale: 2 }),
  issuedAt: timestamp('issued_at', { withTimezone: true }).defaultNow().notNull(),
  dueAt: timestamp('due_at', { withTimezone: true }),
  paidAt: timestamp('paid_at', { withTimezone: true }),
  notes: text('notes'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
