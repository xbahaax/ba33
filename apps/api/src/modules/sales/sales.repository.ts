import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_TOKEN } from '../../common/database/database.module';
import type { Database } from '../../common/database/client';
import {
  buyers,
  orders,
  orderItems,
  shipments,
} from '../../common/database/schema';
import { eq, and, desc } from 'drizzle-orm';

@Injectable()
export class SalesRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  // ── Buyers ──────────────────────────────────────────────

  async createBuyer(data: {
    userId: string;
    companyName: string;
    registrationNumber?: string;
    preferredChannel: 'national' | 'export' | 'institutional';
    creditLimit?: string;
    billingAddress: unknown;
    shippingAddresses: unknown;
  }) {
    const [buyer] = await this.db.insert(buyers).values(data).returning();
    return buyer;
  }

  async findBuyerById(userId: string) {
    const [buyer] = await this.db
      .select()
      .from(buyers)
      .where(eq(buyers.userId, userId))
      .limit(1);
    return buyer ?? null;
  }

  async findAllBuyers() {
    return this.db.select().from(buyers);
  }

  // ── Orders ──────────────────────────────────────────────

  async createOrder(data: {
    id: string;
    buyerId: string;
    channel: 'national' | 'export' | 'institutional';
    status?: 'draft' | 'quote' | 'confirmed' | 'paid' | 'preparing' | 'shipped' | 'delivered' | 'returned' | 'cancelled';
    subtotal: string;
    tax: string;
    total: string;
    currency?: string;
  }) {
    const [order] = await this.db.insert(orders).values(data).returning();
    return order;
  }

  async findOrderById(id: string) {
    const [order] = await this.db
      .select()
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1);
    return order ?? null;
  }

  async findOrdersByBuyer(buyerId: string) {
    return this.db
      .select()
      .from(orders)
      .where(eq(orders.buyerId, buyerId))
      .orderBy(desc(orders.createdAt));
  }

  async updateOrder(
    id: string,
    data: Partial<{
      status: string;
      paymentStatus: string;
      subtotal: string;
      tax: string;
      total: string;
      quotedAt: Date;
      confirmedAt: Date;
      deliveredAt: Date;
      updatedAt: Date;
    }>,
  ) {
    const [order] = await this.db
      .update(orders)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(orders.id, id))
      .returning();
    return order;
  }

  // ── Order Items ─────────────────────────────────────────

  async addOrderItem(data: {
    id: string;
    orderId: string;
    productId: string;
    productCode: string;
    quantity: string;
    unitPrice: string;
    subtotal: string;
  }) {
    const [item] = await this.db.insert(orderItems).values(data).returning();
    return item;
  }

  async findOrderItems(orderId: string) {
    return this.db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));
  }

  // ── Shipments ───────────────────────────────────────────

  async createShipment(data: {
    id: string;
    orderId: string;
    status?: 'pending' | 'in_transit' | 'delivered' | 'returned';
    trackingReference?: string;
    shippedAt?: Date;
  }) {
    const [shipment] = await this.db.insert(shipments).values(data).returning();
    return shipment;
  }

  async findShipmentsByOrder(orderId: string) {
    return this.db
      .select()
      .from(shipments)
      .where(eq(shipments.orderId, orderId));
  }

  async updateShipment(
    id: string,
    data: Partial<{
      status: string;
      trackingReference: string;
      shippedAt: Date;
      deliveredAt: Date;
    }>,
  ) {
    const [shipment] = await this.db
      .update(shipments)
      .set(data as any)
      .where(eq(shipments.id, id))
      .returning();
    return shipment;
  }
}
