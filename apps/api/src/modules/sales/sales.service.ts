import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { SalesRepository } from './sales.repository';
import { EventsService } from '../events/events.service';
import { v4 as uuid } from 'uuid';

const TAX_RATE = 0.19; // 19% TVA Algeria

@Injectable()
export class SalesService {
  private readonly logger = new Logger(SalesService.name);

  constructor(
    private readonly salesRepository: SalesRepository,
    private readonly eventsService: EventsService,
  ) {}

  // ── Buyers ──────────────────────────────────────────────

  async registerBuyer(data: {
    userId: string;
    companyName: string;
    registrationNumber?: string;
    preferredChannel: 'national' | 'export' | 'institutional';
    creditLimit?: string;
    billingAddress: unknown;
    shippingAddresses: unknown;
  }) {
    return this.salesRepository.createBuyer(data);
  }

  async getBuyer(userId: string) {
    const buyer = await this.salesRepository.findBuyerById(userId);
    if (!buyer) {
      throw new NotFoundException(`Buyer profile not found for user ${userId}`);
    }
    return buyer;
  }

  async listBuyers() {
    return this.salesRepository.findAllBuyers();
  }

  // ── Orders ──────────────────────────────────────────────

  async createOrder(
    buyerId: string,
    channel: 'national' | 'export' | 'institutional',
    items: Array<{
      productId: string;
      productCode: string;
      quantity: number;
      unitPrice: number;
    }>,
  ) {
    const buyer = await this.salesRepository.findBuyerById(buyerId);
    if (!buyer) {
      throw new NotFoundException(`Buyer ${buyerId} not found`);
    }

    if (items.length === 0) {
      throw new BadRequestException('Order must have at least one item');
    }

    const orderId = uuid();
    let subtotal = 0;

    for (const item of items) {
      subtotal += item.quantity * item.unitPrice;
    }

    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;

    const order = await this.salesRepository.createOrder({
      id: orderId,
      buyerId,
      channel,
      status: 'draft',
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2),
    });

    for (const item of items) {
      const itemSubtotal = item.quantity * item.unitPrice;
      await this.salesRepository.addOrderItem({
        id: uuid(),
        orderId,
        productId: item.productId,
        productCode: item.productCode,
        quantity: item.quantity.toString(),
        unitPrice: item.unitPrice.toFixed(2),
        subtotal: itemSubtotal.toFixed(2),
      });
    }

    await this.eventsService.emit({
      eventType: 'sales.order.created',
      aggregateType: 'order',
      aggregateId: orderId,
      actorId: buyerId,
      actorType: 'buyer',
      payload: { channel, itemCount: items.length, total: total.toFixed(2) },
      occurredAt: new Date(),
      version: 1,
    });

    return order;
  }

  async getOrder(id: string) {
    const order = await this.salesRepository.findOrderById(id);
    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }
    const items = await this.salesRepository.findOrderItems(id);
    const shipmentList = await this.salesRepository.findShipmentsByOrder(id);
    return { ...order, items, shipments: shipmentList };
  }

  async getBuyerOrders(buyerId: string) {
    return this.salesRepository.findOrdersByBuyer(buyerId);
  }

  // ── Order Lifecycle ─────────────────────────────────────

  async confirmOrder(orderId: string) {
    const order = await this.getOrderOrFail(orderId);
    if (order.status !== 'draft' && order.status !== 'quote') {
      throw new BadRequestException(`Order is "${order.status}", cannot confirm`);
    }

    const updated = await this.salesRepository.updateOrder(orderId, {
      status: 'confirmed',
      confirmedAt: new Date(),
    });

    await this.emitOrderEvent(orderId, 'sales.order.confirmed', { previousStatus: order.status });
    return updated;
  }

  async markOrderPaid(orderId: string) {
    const order = await this.getOrderOrFail(orderId);

    const updated = await this.salesRepository.updateOrder(orderId, {
      status: 'paid',
      paymentStatus: 'paid',
    });

    await this.emitOrderEvent(orderId, 'sales.order.paid', {});
    return updated;
  }

  async shipOrder(orderId: string, trackingReference?: string) {
    const order = await this.getOrderOrFail(orderId);
    if (order.status !== 'paid' && order.status !== 'preparing') {
      throw new BadRequestException(`Order is "${order.status}", cannot ship`);
    }

    const shipment = await this.salesRepository.createShipment({
      id: uuid(),
      orderId,
      status: 'in_transit',
      trackingReference,
      shippedAt: new Date(),
    });

    await this.salesRepository.updateOrder(orderId, { status: 'shipped' });

    await this.emitOrderEvent(orderId, 'sales.order.shipped', {
      shipmentId: shipment.id,
      trackingReference,
    });

    return shipment;
  }

  async deliverOrder(orderId: string) {
    const order = await this.getOrderOrFail(orderId);
    if (order.status !== 'shipped') {
      throw new BadRequestException(`Order is "${order.status}", cannot deliver`);
    }

    const updated = await this.salesRepository.updateOrder(orderId, {
      status: 'delivered',
      deliveredAt: new Date(),
    });

    // Update shipments
    const shipmentList = await this.salesRepository.findShipmentsByOrder(orderId);
    for (const s of shipmentList) {
      await this.salesRepository.updateShipment(s.id, {
        status: 'delivered',
        deliveredAt: new Date(),
      });
    }

    await this.emitOrderEvent(orderId, 'sales.order.delivered', {});
    return updated;
  }

  async cancelOrder(orderId: string) {
    const order = await this.getOrderOrFail(orderId);
    if (order.status === 'delivered' || order.status === 'cancelled') {
      throw new BadRequestException(`Order is "${order.status}", cannot cancel`);
    }

    const updated = await this.salesRepository.updateOrder(orderId, {
      status: 'cancelled',
    });

    await this.emitOrderEvent(orderId, 'sales.order.cancelled', {
      previousStatus: order.status,
    });
    return updated;
  }

  // ── Helpers ─────────────────────────────────────────────

  private async getOrderOrFail(id: string) {
    const order = await this.salesRepository.findOrderById(id);
    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }
    return order;
  }

  private async emitOrderEvent(
    orderId: string,
    eventType: string,
    payload: Record<string, unknown>,
  ) {
    await this.eventsService.emit({
      eventType,
      aggregateType: 'order',
      aggregateId: orderId,
      actorType: 'system',
      payload,
      occurredAt: new Date(),
      version: 1,
    });
  }
}
