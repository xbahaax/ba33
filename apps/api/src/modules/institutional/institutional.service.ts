import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_TOKEN } from '../../common/database/database.module';
import type { Database } from '../../common/database/client';
import { users, sources, lots, preLots, regions, depots, transportJobs } from '../../common/database/schema';
import { eq, count, sum, sql, desc } from 'drizzle-orm';

@Injectable()
export class InstitutionalService {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async getDashboardSummary() {
    // Total users by type
    const usersByType = await this.db
      .select({ userType: users.userType, count: count() })
      .from(users)
      .groupBy(users.userType);

    // Total sources by type
    const sourcesByType = await this.db
      .select({ sourceType: sources.sourceType, count: count() })
      .from(sources)
      .groupBy(sources.sourceType);

    // Total lots by status
    const lotsByStatus = await this.db
      .select({ status: lots.status, count: count() })
      .from(lots)
      .groupBy(lots.status);

    // Total pre-lots by status
    const preLotsByStatus = await this.db
      .select({ status: preLots.status, count: count() })
      .from(preLots)
      .groupBy(preLots.status);

    // Total weight metrics
    const weightMetrics = await this.db
      .select({
        totalDeclaredKg: sum(lots.declaredWeightKg),
        totalActualKg: sum(lots.actualWeightKg),
        lotCount: count(),
      })
      .from(lots);

    // Transport jobs by status
    const jobsByStatus = await this.db
      .select({ status: transportJobs.status, count: count() })
      .from(transportJobs)
      .groupBy(transportJobs.status);

    // Depot summary
    const depotSummary = await this.db
      .select({
        totalDepots: count(),
        totalCapacityKg: sum(depots.capacityKg),
        totalCurrentKg: sum(depots.currentWeightKg),
      })
      .from(depots)
      .where(eq(depots.active, true));

    // Recent lots (last 10)
    const recentLots = await this.db
      .select({
        id: lots.id,
        qrCode: lots.qrCode,
        status: lots.status,
        sourceType: lots.sourceType,
        declaredWeightKg: lots.declaredWeightKg,
        actualWeightKg: lots.actualWeightKg,
        isUrgent: lots.isUrgent,
        createdAt: lots.createdAt,
      })
      .from(lots)
      .orderBy(desc(lots.createdAt))
      .limit(10);

    // Region count
    const regionCount = await this.db
      .select({ count: count() })
      .from(regions);

    return {
      users: {
        total: usersByType.reduce((s, r) => s + Number(r.count), 0),
        byType: Object.fromEntries(usersByType.map(r => [r.userType, Number(r.count)])),
      },
      sources: {
        total: sourcesByType.reduce((s, r) => s + Number(r.count), 0),
        byType: Object.fromEntries(sourcesByType.map(r => [r.sourceType, Number(r.count)])),
      },
      lots: {
        total: lotsByStatus.reduce((s, r) => s + Number(r.count), 0),
        byStatus: Object.fromEntries(lotsByStatus.map(r => [r.status, Number(r.count)])),
        totalDeclaredKg: weightMetrics[0]?.totalDeclaredKg ?? '0',
        totalActualKg: weightMetrics[0]?.totalActualKg ?? '0',
      },
      preLots: {
        total: preLotsByStatus.reduce((s, r) => s + Number(r.count), 0),
        byStatus: Object.fromEntries(preLotsByStatus.map(r => [r.status, Number(r.count)])),
      },
      transport: {
        total: jobsByStatus.reduce((s, r) => s + Number(r.count), 0),
        byStatus: Object.fromEntries(jobsByStatus.map(r => [r.status, Number(r.count)])),
      },
      depot: {
        totalDepots: Number(depotSummary[0]?.totalDepots ?? 0),
        totalCapacityKg: depotSummary[0]?.totalCapacityKg ?? '0',
        totalCurrentKg: depotSummary[0]?.totalCurrentKg ?? '0',
      },
      regions: { total: Number(regionCount[0]?.count ?? 0) },
      recentLots,
    };
  }

  async getSourcesByRegion() {
    const result = await this.db
      .select({
        regionId: sources.regionId,
        regionName: regions.name,
        sourceType: sources.sourceType,
        count: count(),
      })
      .from(sources)
      .innerJoin(regions, eq(sources.regionId, regions.id))
      .groupBy(sources.regionId, regions.name, sources.sourceType)
      .orderBy(regions.name);

    return result;
  }

  async getLotsByRegion() {
    const result = await this.db
      .select({
        regionName: regions.name,
        status: lots.status,
        count: count(),
        totalWeightKg: sum(lots.actualWeightKg),
      })
      .from(lots)
      .innerJoin(sources, eq(lots.sourceId, sources.id))
      .innerJoin(regions, eq(sources.regionId, regions.id))
      .groupBy(regions.name, lots.status)
      .orderBy(regions.name);

    return result;
  }

  async getRecentActivity(limit = 20) {
    // Recent lots
    const recentLots = await this.db
      .select({
        id: lots.id,
        type: sql<string>`'lot'`,
        qrCode: lots.qrCode,
        status: lots.status,
        sourceType: lots.sourceType,
        weight: lots.actualWeightKg,
        isUrgent: lots.isUrgent,
        createdAt: lots.createdAt,
      })
      .from(lots)
      .orderBy(desc(lots.createdAt))
      .limit(limit);

    // Recent pre-lots
    const recentPreLots = await this.db
      .select({
        id: preLots.id,
        type: sql<string>`'pre_lot'`,
        status: preLots.status,
        weight: preLots.estimatedWeightKg,
        createdAt: preLots.createdAt,
      })
      .from(preLots)
      .orderBy(desc(preLots.createdAt))
      .limit(limit);

    return { recentLots, recentPreLots };
  }
}
