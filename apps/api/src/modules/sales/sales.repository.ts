import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, desc, eq, sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { DATABASE_TOKEN } from '../../common/database/database.module';
import type { Database } from '../../common/database/client';
import { appendWorkflowEvent } from '../../common/workflow/workflow-events';
import {
  buyerCatalogProducts,
  buyerComplaints,
  buyers,
  orderItems,
  orders,
  salesDocuments,
  shipments,
} from '../../common/database/schema';
import { AdvanceOrderDto } from './dto/advance-order.dto';
import type {
  BuyerAddress,
  BuyerComplaint,
  BuyerOrder,
  BuyerProduct,
  BuyerProfile,
  ComplaintType,
  DocumentType,
  OrderItem,
  OrderStatus,
  ProductGrade,
  ProductType,
  SalesChannel,
} from './buyer-read-model';

export interface ProductQuery {
  type?: ProductType | 'all';
  grade?: ProductGrade | string;
  region?: string;
  certified?: string;
  inStock?: string;
  channel?: SalesChannel;
  sortBy?: 'price_asc' | 'price_desc' | 'grade' | 'availability' | 'created_at';
  page?: string;
  limit?: string;
}

export interface OrderQuery {
  status?: OrderStatus | 'all';
  page?: string;
  limit?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CreateOrderInput {
  channel?: SalesChannel;
  items?: OrderItem[];
  shippingAddressId?: string;
}

export interface CreateComplaintInput {
  orderId: string;
  type: ComplaintType;
  description?: string;
  resolution?: string;
}

export interface AddressInput {
  siteName: string;
  line1: string;
  line2?: string;
  commune: string;
  wilaya: string;
  postalCode: string;
  instructions?: string;
}

type DbOrderStatus = typeof orders.$inferSelect.status;
type DbDocType = typeof salesDocuments.$inferSelect.type;

@Injectable()
export class SalesRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async getOverview() {
    const statusBreakdown = await this.db
      .select({
        status: orders.status,
        count: sql<number>`count(*)::int`,
      })
      .from(orders)
      .groupBy(orders.status)
      .orderBy(orders.status);

    const recentOrders = await this.db
      .select({
        id: orders.id,
        channel: orders.channel,
        status: orders.status,
        paymentStatus: orders.paymentStatus,
        total: orders.total,
        currency: orders.currency,
        createdAt: orders.createdAt,
        confirmedAt: orders.confirmedAt,
        shipmentStatus: shipments.status,
        trackingReference: shipments.trackingReference,
        buyerCompanyName: buyers.companyName,
      })
      .from(orders)
      .leftJoin(buyers, eq(orders.buyerId, buyers.userId))
      .leftJoin(shipments, eq(shipments.orderId, orders.id))
      .orderBy(desc(orders.createdAt))
      .limit(8);

    const breakdownMap = new Map(statusBreakdown.map((row) => [row.status, row.count]));

    return {
      summary: {
        totalOrders: statusBreakdown.reduce((sum, row) => sum + row.count, 0),
        openOrders:
          (breakdownMap.get('draft') ?? 0) +
          (breakdownMap.get('quote') ?? 0) +
          (breakdownMap.get('confirmed') ?? 0) +
          (breakdownMap.get('paid') ?? 0) +
          (breakdownMap.get('preparing') ?? 0),
        shippedOrders: breakdownMap.get('shipped') ?? 0,
        deliveredOrders: breakdownMap.get('delivered') ?? 0,
        returnedOrders: breakdownMap.get('returned') ?? 0,
        statusBreakdown,
      },
      orders: recentOrders,
    };
  }

  async advanceOrder(
    orderId: string,
    input: AdvanceOrderDto,
    actorId: string,
    actorType: string,
  ) {
    const [order] = await this.db
      .select({
        id: orders.id,
        status: orders.status,
        paymentStatus: orders.paymentStatus,
      })
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order) {
      throw new NotFoundException('Commande introuvable.');
    }

    const [existingShipment] = await this.db
      .select({
        id: shipments.id,
      })
      .from(shipments)
      .where(eq(shipments.orderId, orderId))
      .limit(1);

    const now = new Date();

    return this.db.transaction(async (tx) => {
      if (input.action === 'confirm') {
        if (!['draft', 'quote'].includes(order.status)) {
          throw new BadRequestException('La commande ne peut pas être confirmée.');
        }

        await tx
          .update(orders)
          .set({
            status: 'confirmed',
            confirmedAt: now,
            updatedAt: now,
          })
          .where(eq(orders.id, orderId));
      }

      if (input.action === 'mark_paid') {
        if (!['confirmed', 'paid', 'preparing', 'shipped'].includes(order.status)) {
          throw new BadRequestException(
            'La commande ne peut pas être réglée depuis son statut actuel.',
          );
        }

        await tx
          .update(orders)
          .set({
            status: order.status === 'confirmed' ? 'paid' : order.status,
            paymentStatus: 'paid',
            updatedAt: now,
          })
          .where(eq(orders.id, orderId));
      }

      if (input.action === 'ship') {
        if (!['confirmed', 'paid', 'preparing'].includes(order.status)) {
          throw new BadRequestException('La commande ne peut pas être expédiée.');
        }

        await tx
          .update(orders)
          .set({
            status: 'shipped',
            updatedAt: now,
          })
          .where(eq(orders.id, orderId));

        if (existingShipment) {
          await tx
            .update(shipments)
            .set({
              status: 'in_transit',
              trackingReference: input.trackingReference ?? null,
              shippedAt: now,
            })
            .where(eq(shipments.id, existingShipment.id));
        } else {
          await tx.insert(shipments).values({
            orderId,
            status: 'in_transit',
            trackingReference: input.trackingReference ?? null,
            shippedAt: now,
          });
        }
      }

      if (input.action === 'deliver') {
        if (!['shipped', 'preparing'].includes(order.status)) {
          throw new BadRequestException('La commande ne peut pas être livrée.');
        }

        await tx
          .update(orders)
          .set({
            status: 'delivered',
            deliveredAt: now,
            updatedAt: now,
          })
          .where(eq(orders.id, orderId));

        if (existingShipment) {
          await tx
            .update(shipments)
            .set({
              status: 'delivered',
              deliveredAt: now,
            })
            .where(eq(shipments.id, existingShipment.id));
        } else {
          await tx.insert(shipments).values({
            orderId,
            status: 'delivered',
            trackingReference: input.trackingReference ?? null,
            deliveredAt: now,
          });
        }
      }

      await appendWorkflowEvent(tx, {
        aggregateId: orderId,
        aggregateType: 'order',
        actorId,
        actorType,
        eventType:
          input.action === 'confirm'
            ? 'order_confirmed'
            : input.action === 'mark_paid'
              ? 'order_paid'
              : input.action === 'ship'
                ? 'shipment_started'
                : 'shipment_delivered',
        occurredAt: now,
        payload: {
          action: input.action,
          trackingReference: input.trackingReference ?? null,
        },
      });

      const [updatedOrder] = await tx
        .select({
          id: orders.id,
          channel: orders.channel,
          status: orders.status,
          paymentStatus: orders.paymentStatus,
          total: orders.total,
          currency: orders.currency,
          createdAt: orders.createdAt,
          confirmedAt: orders.confirmedAt,
          shipmentStatus: shipments.status,
          trackingReference: shipments.trackingReference,
          buyerCompanyName: buyers.companyName,
        })
        .from(orders)
        .leftJoin(buyers, eq(orders.buyerId, buyers.userId))
        .leftJoin(shipments, eq(shipments.orderId, orders.id))
        .where(eq(orders.id, orderId))
        .limit(1);

      return updatedOrder;
    });
  }

  async listProducts(query: ProductQuery): Promise<PaginatedResponse<BuyerProduct>> {
    const rows = await this.db.select().from(buyerCatalogProducts);
    let result = rows.map((row) => this.toBuyerProduct(row));

    if (query.type && query.type !== 'all') {
      result = result.filter((product) => product.type === query.type);
    }

    if (query.grade) {
      const grades = query.grade.split(',').filter(Boolean);
      result = result.filter((product) => grades.includes(product.grade));
    }

    if (query.region && query.region !== 'Toutes') {
      result = result.filter((product) => product.region === query.region);
    }

    if (query.certified === 'true') {
      result = result.filter((product) => product.nfnSealStatus === 'certified');
    }

    if (query.inStock === 'true') {
      result = result.filter((product) => product.availableQuantityKg > 0);
    }

    result.sort((left, right) => {
      switch (query.sortBy) {
        case 'price_desc':
          return right.pricePerKgDzd - left.pricePerKgDzd;
        case 'grade':
          return left.grade.localeCompare(right.grade);
        case 'availability':
          return right.availableQuantityKg - left.availableQuantityKg;
        case 'created_at':
          return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
        case 'price_asc':
        default:
          return left.pricePerKgDzd - right.pricePerKgDzd;
      }
    });

    return this.paginate(result, query.page, query.limit);
  }

  async findProduct(productId: string): Promise<BuyerProduct | undefined> {
    const rows = await this.db
      .select()
      .from(buyerCatalogProducts)
      .where(eq(buyerCatalogProducts.id, productId))
      .limit(1);

    if (rows[0]) {
      return this.toBuyerProduct(rows[0]);
    }

    const byCode = await this.db
      .select()
      .from(buyerCatalogProducts)
      .where(eq(buyerCatalogProducts.code, productId))
      .limit(1);

    return byCode[0] ? this.toBuyerProduct(byCode[0]) : undefined;
  }

  async findProductByCertificate(code: string): Promise<BuyerProduct | undefined> {
    const rows = await this.db
      .select()
      .from(buyerCatalogProducts)
      .where(eq(buyerCatalogProducts.nfnSealCode, code))
      .limit(1);

    return rows[0] ? this.toBuyerProduct(rows[0]) : undefined;
  }

  async listOrders(buyerId: string, query: OrderQuery): Promise<PaginatedResponse<BuyerOrder>> {
    const dbStatus = query.status && query.status !== 'all' ? this.toDbOrderStatus(query.status) : undefined;
    const rows = await this.db
      .select()
      .from(orders)
      .where(dbStatus ? and(eq(orders.buyerId, buyerId), eq(orders.status, dbStatus)) : eq(orders.buyerId, buyerId))
      .orderBy(desc(orders.createdAt));

    const mapped = await Promise.all(rows.map((order) => this.toBuyerOrder(order)));
    return this.paginate(mapped, query.page, query.limit);
  }

  async findOrder(buyerId: string, orderCode: string): Promise<BuyerOrder | undefined> {
    const rows = await this.db
      .select()
      .from(orders)
      .where(and(eq(orders.buyerId, buyerId), eq(orders.orderCode, orderCode)))
      .limit(1);

    return rows[0] ? this.toBuyerOrder(rows[0]) : undefined;
  }

  async createOrder(buyerId: string, input: CreateOrderInput): Promise<BuyerOrder> {
    const buyer = await this.getBuyer(buyerId);
    const addresses = this.parseAddresses(buyer.shippingAddresses);
    const shippingAddress = addresses.find((address) => address.id === input.shippingAddressId) ?? addresses.find((address) => address.isDefault) ?? addresses[0];
    const items = input.items ?? [];
    const subtotal = items.reduce((sum, item) => sum + item.quantityKg * item.unitPriceDzd, 0);
    const orderCode = `CMD-${new Date().getUTCFullYear()}-${String(Date.now()).slice(-5)}`;

    const [created] = await this.db
      .insert(orders)
      .values({
        orderCode,
        buyerId,
        channel: input.channel ?? buyer.preferredChannel,
        status: 'draft',
        paymentStatus: 'pending',
        subtotal: String(subtotal),
        tax: '0',
        total: String(subtotal),
        currency: input.channel === 'export' ? 'EUR' : 'DZD',
        shippingAddress: shippingAddress ?? {},
      })
      .returning();

    if (items.length > 0) {
      await this.db.insert(orderItems).values(
        items.map((item) => ({
          orderId: created.id,
          productId: item.productId,
          productCode: item.productCode,
          productName: item.productName,
          grade: item.grade,
          quantity: String(item.quantityKg),
          unitPrice: String(item.unitPriceDzd),
          subtotal: String(item.quantityKg * item.unitPriceDzd),
        })),
      );
    }

    return this.toBuyerOrder(created);
  }

  async replaceOrderItems(buyerId: string, orderCode: string, items: OrderItem[]): Promise<BuyerOrder | undefined> {
    const order = await this.findDbOrder(buyerId, orderCode);

    if (!order) {
      return undefined;
    }

    await this.db.delete(orderItems).where(eq(orderItems.orderId, order.id));

    if (items.length > 0) {
      await this.db.insert(orderItems).values(
        items.map((item) => ({
          orderId: order.id,
          productId: item.productId,
          productCode: item.productCode,
          productName: item.productName,
          grade: item.grade,
          quantity: String(item.quantityKg),
          unitPrice: String(item.unitPriceDzd),
          subtotal: String(item.quantityKg * item.unitPriceDzd),
        })),
      );
    }

    const total = items.reduce((sum, item) => sum + item.quantityKg * item.unitPriceDzd, 0);
    const [updated] = await this.db
      .update(orders)
      .set({ subtotal: String(total), total: String(total), updatedAt: new Date() })
      .where(eq(orders.id, order.id))
      .returning();

    return this.toBuyerOrder(updated);
  }

  async removeOrderItem(buyerId: string, orderCode: string, itemId: string): Promise<BuyerOrder | undefined> {
    const order = await this.findDbOrder(buyerId, orderCode);

    if (!order) {
      return undefined;
    }

    await this.db.delete(orderItems).where(and(eq(orderItems.orderId, order.id), eq(orderItems.productId, itemId)));
    const remainingItems = await this.listDbOrderItems(order.id);
    const total = remainingItems.reduce((sum, item) => sum + Number(item.subtotal), 0);
    const [updated] = await this.db
      .update(orders)
      .set({ subtotal: String(total), total: String(total), updatedAt: new Date() })
      .where(eq(orders.id, order.id))
      .returning();
    return this.toBuyerOrder(updated);
  }

  async updateOrderStatus(buyerId: string, orderCode: string, status: OrderStatus): Promise<BuyerOrder | undefined> {
    const order = await this.findDbOrder(buyerId, orderCode);

    if (!order) {
      return undefined;
    }

    const dbStatus = this.toDbOrderStatus(status);
    const [updated] = await this.db
      .update(orders)
      .set({ status: dbStatus, updatedAt: new Date(), confirmedAt: dbStatus === 'confirmed' ? new Date() : order.confirmedAt })
      .where(eq(orders.id, order.id))
      .returning();
    return this.toBuyerOrder(updated);
  }

  async confirmOrder(buyerId: string, orderCode: string): Promise<BuyerOrder | undefined> {
    return this.updateOrderStatus(buyerId, orderCode, 'confirmed');
  }

  async listOrderDocuments(buyerId: string, orderCode: string): Promise<BuyerOrder['documents'] | undefined> {
    const order = await this.findOrder(buyerId, orderCode);
    return order?.documents;
  }

  async findOrderDocument(buyerId: string, orderCode: string, documentId: string): Promise<BuyerOrder['documents'][number] | undefined> {
    const order = await this.findDbOrder(buyerId, orderCode);

    if (!order) {
      return undefined;
    }

    const docs = await this.db
      .select()
      .from(salesDocuments)
      .where(and(eq(salesDocuments.orderId, order.id), eq(salesDocuments.id, documentId)))
      .limit(1);

    return docs[0] ? this.toOrderDocument(docs[0], order.orderCode) : undefined;
  }

  async listAllDocuments(buyerId: string, type?: DocumentType | 'all'): Promise<BuyerOrder['documents']> {
    const dbOrders = await this.db.select().from(orders).where(eq(orders.buyerId, buyerId));
    const docs = await Promise.all(
      dbOrders.map(async (order) => {
        const documents = await this.db.select().from(salesDocuments).where(eq(salesDocuments.orderId, order.id));
        return documents.map((document) => this.toOrderDocument(document, order.orderCode));
      }),
    );
    const flatDocuments = docs.flat();
    return type && type !== 'all' ? flatDocuments.filter((document) => document.type === type) : flatDocuments;
  }

  async listComplaints(buyerId: string): Promise<BuyerComplaint[]> {
    const rows = await this.db
      .select()
      .from(buyerComplaints)
      .where(eq(buyerComplaints.buyerId, buyerId))
      .orderBy(desc(buyerComplaints.submittedAt));
    return rows.map((row) => ({
      id: row.id,
      orderId: row.orderCode,
      type: row.type as ComplaintType,
      description: row.description,
      resolution: row.resolution,
      submittedAt: row.submittedAt.toISOString(),
      status: row.status as BuyerComplaint['status'],
    }));
  }

  async findComplaint(buyerId: string, complaintId: string): Promise<BuyerComplaint | undefined> {
    const rows = await this.db
      .select()
      .from(buyerComplaints)
      .where(and(eq(buyerComplaints.buyerId, buyerId), eq(buyerComplaints.id, complaintId)))
      .limit(1);
    const row = rows[0];
    return row
      ? {
          id: row.id,
          orderId: row.orderCode,
          type: row.type as ComplaintType,
          description: row.description,
          resolution: row.resolution,
          submittedAt: row.submittedAt.toISOString(),
          status: row.status as BuyerComplaint['status'],
        }
      : undefined;
  }

  async createComplaint(buyerId: string, input: CreateComplaintInput): Promise<BuyerComplaint> {
    const id = `REC-${new Date().getUTCFullYear()}-${String(Date.now()).slice(-4)}`;
    const [created] = await this.db
      .insert(buyerComplaints)
      .values({
        id,
        buyerId,
        orderCode: input.orderId,
        type: input.type,
        status: 'review',
        description: input.description ?? '',
        resolution: input.resolution ?? '',
      })
      .returning();

    return {
      id: created.id,
      orderId: created.orderCode,
      type: created.type as ComplaintType,
      description: created.description,
      resolution: created.resolution,
      submittedAt: created.submittedAt.toISOString(),
      status: created.status as BuyerComplaint['status'],
    };
  }

  async getProfile(buyerId: string): Promise<BuyerProfile> {
    const buyer = await this.getBuyer(buyerId);
    return {
      companyName: buyer.companyName,
      registrationNumber: buyer.registrationNumber ?? '',
      contactEmail: '',
      preferredChannel: buyer.preferredChannel,
    };
  }

  async updateProfile(buyerId: string, input: Partial<BuyerProfile>): Promise<BuyerProfile> {
    const [updated] = await this.db
      .update(buyers)
      .set({
        companyName: input.companyName,
        registrationNumber: input.registrationNumber,
        preferredChannel: input.preferredChannel,
      })
      .where(eq(buyers.userId, buyerId))
      .returning();
    return {
      companyName: updated.companyName,
      registrationNumber: updated.registrationNumber ?? '',
      contactEmail: input.contactEmail ?? '',
      preferredChannel: updated.preferredChannel,
    };
  }

  async listAddresses(buyerId: string): Promise<BuyerAddress[]> {
    const buyer = await this.getBuyer(buyerId);
    return this.parseAddresses(buyer.shippingAddresses);
  }

  async createAddress(buyerId: string, input: AddressInput): Promise<BuyerAddress> {
    const current = await this.listAddresses(buyerId);
    const address: BuyerAddress = {
      id: `ADDR-${String(current.length + 1).padStart(2, '0')}`,
      ...input,
      isDefault: current.length === 0,
    };
    await this.saveAddresses(buyerId, [...current, address]);
    return address;
  }

  async updateAddress(buyerId: string, addressId: string, input: Partial<AddressInput> & { isDefault?: boolean }): Promise<BuyerAddress | undefined> {
    const current = await this.listAddresses(buyerId);
    let updatedAddress: BuyerAddress | undefined;
    const next = current.map((address) => {
      if (address.id !== addressId) {
        return input.isDefault ? { ...address, isDefault: false } : address;
      }

      updatedAddress = { ...address, ...input, isDefault: input.isDefault ?? address.isDefault };
      return updatedAddress;
    });

    if (!updatedAddress) {
      return undefined;
    }

    await this.saveAddresses(buyerId, next);
    return updatedAddress;
  }

  async deleteAddress(buyerId: string, addressId: string): Promise<boolean> {
    const current = await this.listAddresses(buyerId);
    const next = current.filter((address) => address.id !== addressId);

    if (next.length === current.length) {
      return false;
    }

    await this.saveAddresses(buyerId, next);
    return true;
  }

  private async getBuyer(buyerId: string): Promise<typeof buyers.$inferSelect> {
    const rows = await this.db.select().from(buyers).where(eq(buyers.userId, buyerId)).limit(1);

    if (!rows[0]) {
      throw new Error(`Buyer ${buyerId} not found`);
    }

    return rows[0];
  }

  private async findDbOrder(buyerId: string, orderCode: string): Promise<typeof orders.$inferSelect | undefined> {
    const rows = await this.db
      .select()
      .from(orders)
      .where(and(eq(orders.buyerId, buyerId), eq(orders.orderCode, orderCode)))
      .limit(1);
    return rows[0];
  }

  private async listDbOrderItems(orderId: string): Promise<Array<typeof orderItems.$inferSelect>> {
    return this.db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  private async toBuyerOrder(order: typeof orders.$inferSelect): Promise<BuyerOrder> {
    const [items, docs, shipment] = await Promise.all([
      this.listDbOrderItems(order.id),
      this.db.select().from(salesDocuments).where(eq(salesDocuments.orderId, order.id)),
      this.db.select().from(shipments).where(eq(shipments.orderId, order.id)).limit(1),
    ]);

    const mappedItems = items.map((item) => ({
      productId: item.productId,
      productCode: item.productCode,
      productName: item.productName,
      grade: item.grade as ProductGrade,
      quantityKg: Number(item.quantity),
      unitPriceDzd: Number(item.unitPrice),
    }));

    return {
      id: order.orderCode,
      items: mappedItems,
      status: this.toBuyerOrderStatus(order.status),
      channel: order.channel,
      totalAmountDzd: Number(order.total),
      totalQuantityKg: mappedItems.reduce((sum, item) => sum + item.quantityKg, 0),
      placedAt: order.createdAt.toISOString(),
      estimatedDelivery: order.status === 'shipped' ? new Date(order.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      deliveredAt: order.deliveredAt?.toISOString(),
      shippingAddress: this.parseAddress(order.shippingAddress),
      trackingNumber: shipment[0]?.trackingReference ?? undefined,
      documents: docs.map((document) => this.toOrderDocument(document, order.orderCode)),
    };
  }

  private toOrderDocument(document: typeof salesDocuments.$inferSelect, orderCode: string): BuyerOrder['documents'][number] {
    return {
      id: document.id,
      type: this.toBuyerDocumentType(document.type),
      title: document.title,
      orderId: orderCode,
      sizeLabel: document.sizeLabel,
      createdAt: document.generatedAt.toISOString(),
    };
  }

  private toBuyerProduct(row: typeof buyerCatalogProducts.$inferSelect): BuyerProduct {
    return {
      id: row.id,
      code: row.code,
      name: row.name,
      type: row.type as ProductType,
      grade: row.grade as ProductGrade,
      region: row.region,
      availableQuantityKg: Number(row.availableQuantityKg),
      pricePerKgDzd: Number(row.pricePerKgDzd),
      pricePerKgEur: row.pricePerKgEur ? Number(row.pricePerKgEur) : undefined,
      nfnSealStatus: row.nfnSealStatus as BuyerProduct['nfnSealStatus'],
      nfnSealCode: row.nfnSealCode ?? undefined,
      nfnCertifiedAt: row.nfnCertifiedAt?.toISOString(),
      description: row.description,
      images: Array.isArray(row.images) ? (row.images as string[]) : [],
      qualityParameters: row.qualityParameters as BuyerProduct['qualityParameters'],
      traceability: row.traceability as BuyerProduct['traceability'],
      createdAt: row.createdAt.toISOString(),
    };
  }

  private parseAddress(value: unknown): BuyerAddress {
    return value && typeof value === 'object'
      ? (value as BuyerAddress)
      : {
          id: randomUUID(),
          siteName: 'Adresse principale',
          line1: '',
          commune: '',
          wilaya: '',
          postalCode: '',
        };
  }

  private parseAddresses(value: unknown): BuyerAddress[] {
    return Array.isArray(value) ? (value as BuyerAddress[]) : [];
  }

  private async saveAddresses(buyerId: string, addresses: BuyerAddress[]): Promise<void> {
    await this.db.update(buyers).set({ shippingAddresses: addresses }).where(eq(buyers.userId, buyerId));
  }

  private toDbOrderStatus(status: OrderStatus): DbOrderStatus {
    const map: Record<OrderStatus, DbOrderStatus> = {
      pending: 'draft',
      confirmed: 'confirmed',
      preparing: 'preparing',
      shipped: 'shipped',
      delivered: 'delivered',
      cancelled: 'cancelled',
      disputed: 'returned',
    };
    return map[status];
  }

  private toBuyerOrderStatus(status: DbOrderStatus): OrderStatus {
    const map: Record<DbOrderStatus, OrderStatus> = {
      draft: 'pending',
      quote: 'pending',
      confirmed: 'confirmed',
      paid: 'confirmed',
      preparing: 'preparing',
      shipped: 'shipped',
      delivered: 'delivered',
      returned: 'disputed',
      cancelled: 'cancelled',
    };
    return map[status];
  }

  private toBuyerDocumentType(type: DbDocType): DocumentType {
    const map: Record<DbDocType, DocumentType> = {
      invoice: 'invoice',
      traceability_certificate: 'certificate',
      origin_certificate: 'certificate',
      export_declaration: 'export',
      other: 'delivery',
    };
    return map[type];
  }

  private paginate<T>(items: T[], rawPage?: string, rawLimit?: string): PaginatedResponse<T> {
    const page = Math.max(1, Number(rawPage ?? '1'));
    const limit = Math.max(1, Number(rawLimit ?? '20'));
    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const currentPage = Math.min(page, totalPages);
    const start = (currentPage - 1) * limit;

    return {
      items: items.slice(start, start + limit),
      page: currentPage,
      limit,
      total,
      totalPages,
    };
  }
}
