import { Inject, Injectable } from '@nestjs/common';
import { desc, or, eq, sql } from 'drizzle-orm';
import { DATABASE_TOKEN } from '../../common/database/database.module';
import type { Database } from '../../common/database/client';
import { lots } from '../../common/database/schema';

@Injectable()
export class LotsRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async getSummary() {
    const statusBreakdown = await this.db
      .select({
        status: lots.status,
        count: sql<number>`count(*)::int`,
      })
      .from(lots)
      .groupBy(lots.status)
      .orderBy(lots.status);

    const [totals] = await this.db
      .select({
        totalLots: sql<number>`count(*)::int`,
      })
      .from(lots);

    const [urgent] = await this.db
      .select({
        urgentLots: sql<number>`count(*)::int`,
      })
      .from(lots)
      .where(or(eq(lots.isUrgent, true), eq(lots.urgency, 'urgent')));

    const recentLots = await this.db
      .select({
        id: lots.id,
        qrCode: lots.qrCode,
        sourceType: lots.sourceType,
        status: lots.status,
        urgency: lots.urgency,
        declaredWeightKg: lots.declaredWeightKg,
        actualWeightKg: lots.actualWeightKg,
        stateQuick: lots.stateQuick,
        collectedAt: lots.collectedAt,
        createdAt: lots.createdAt,
      })
      .from(lots)
      .orderBy(desc(lots.createdAt))
      .limit(8);

    const breakdownMap = new Map(statusBreakdown.map((row) => [row.status, row.count]));

    return {
      summary: {
        totalLots: totals?.totalLots ?? 0,
        urgentLots: urgent?.urgentLots ?? 0,
        inTransitLots: breakdownMap.get('in_transit') ?? 0,
        inDepotLots:
          (breakdownMap.get('received_depot') ?? 0) +
          (breakdownMap.get('in_pretri') ?? 0) +
          (breakdownMap.get('stored') ?? 0),
        certifiedLots: breakdownMap.get('certified') ?? 0,
        soldLots: breakdownMap.get('sold') ?? 0,
        statusBreakdown,
      },
      recentLots,
    };
  }
}
