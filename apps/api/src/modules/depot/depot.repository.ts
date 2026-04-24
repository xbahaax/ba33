import { Inject, Injectable } from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';
import { DATABASE_TOKEN } from '../../common/database/database.module';
import type { Database } from '../../common/database/client';
import { a1Alerts, depots, depotReceptions, depotZones, lots, regions, users } from '../../common/database/schema';

@Injectable()
export class DepotRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async getOverview() {
    const depotRows = await this.db
      .select({
        id: depots.id,
        name: depots.name,
        address: depots.address,
        active: depots.active,
        capacityKg: depots.capacityKg,
        currentWeightKg: depots.currentWeightKg,
        updatedAt: depots.updatedAt,
        regionName: regions.name,
        managerName: users.fullName,
      })
      .from(depots)
      .leftJoin(regions, eq(depots.regionId, regions.id))
      .leftJoin(users, eq(depots.managerId, users.id))
      .orderBy(desc(depots.updatedAt));

    const recentReceptions = await this.db
      .select({
        id: depotReceptions.id,
        depotName: depots.name,
        lotId: lots.id,
        lotQrCode: lots.qrCode,
        actualWeightKg: depotReceptions.actualWeightKg,
        discrepancyKg: depotReceptions.discrepancyKg,
        toleranceExceeded: depotReceptions.toleranceExceeded,
        zoneCode: depotZones.code,
        receivedAt: depotReceptions.receivedAt,
      })
      .from(depotReceptions)
      .leftJoin(depots, eq(depotReceptions.depotId, depots.id))
      .leftJoin(lots, eq(depotReceptions.lotId, lots.id))
      .leftJoin(depotZones, eq(depotReceptions.zoneId, depotZones.id))
      .orderBy(desc(depotReceptions.receivedAt))
      .limit(8);

    const recentAlerts = await this.db
      .select({
        id: a1Alerts.id,
        depotName: depots.name,
        severity: a1Alerts.severity,
        status: a1Alerts.status,
        firedAt: a1Alerts.firedAt,
        resolvedAt: a1Alerts.resolvedAt,
      })
      .from(a1Alerts)
      .leftJoin(depots, eq(a1Alerts.depotId, depots.id))
      .orderBy(desc(a1Alerts.firedAt))
      .limit(6);

    const totalCapacityKg = depotRows.reduce(
      (sum, row) => sum + Number(row.capacityKg ?? 0),
      0,
    );
    const currentWeightKg = depotRows.reduce(
      (sum, row) => sum + Number(row.currentWeightKg ?? 0),
      0,
    );

    return {
      summary: {
        totalDepots: depotRows.length,
        activeDepots: depotRows.filter((row) => row.active).length,
        totalCapacityKg,
        currentWeightKg,
        occupancyRate: totalCapacityKg > 0 ? currentWeightKg / totalCapacityKg : 0,
        openAlerts: recentAlerts.filter((alert) => alert.status !== 'resolved').length,
      },
      depots: depotRows.map((row) => ({
        ...row,
        occupancyRate:
          Number(row.capacityKg ?? 0) > 0
            ? Number(row.currentWeightKg ?? 0) / Number(row.capacityKg ?? 0)
            : 0,
      })),
      recentReceptions,
      recentAlerts,
    };
  }
}
