import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { desc, eq, sql } from 'drizzle-orm';
import { DATABASE_TOKEN } from '../../common/database/database.module';
import type { Database } from '../../common/database/client';
import { buyers, orders, shipments } from '../../common/database/schema';
import { appendWorkflowEvent } from '../../common/workflow/workflow-events';
import { AdvanceOrderDto } from './dto/advance-order.dto';

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
          throw new BadRequestException('La commande ne peut pas être réglée depuis son statut actuel.');
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
}
