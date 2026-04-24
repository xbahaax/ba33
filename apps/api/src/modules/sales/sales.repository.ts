import { Inject, Injectable } from '@nestjs/common';
import { desc, eq, sql } from 'drizzle-orm';
import { DATABASE_TOKEN } from '../../common/database/database.module';
import type { Database } from '../../common/database/client';
import { buyers, orders } from '../../common/database/schema';

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
        buyerCompanyName: buyers.companyName,
      })
      .from(orders)
      .leftJoin(buyers, eq(orders.buyerId, buyers.userId))
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
}
