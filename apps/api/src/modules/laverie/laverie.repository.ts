import { Inject, Injectable } from '@nestjs/common';
import { desc, eq, isNull, sql } from 'drizzle-orm';
import { DATABASE_TOKEN } from '../../common/database/database.module';
import type { Database } from '../../common/database/client';
import {
  laveries,
  qualifications,
  users,
  washingRuns,
} from '../../common/database/schema';

@Injectable()
export class LaverieRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async getOverview() {
    const facilities = await this.db
      .select({
        id: laveries.id,
        name: laveries.name,
        address: laveries.address,
        dailyCapacityKg: laveries.dailyCapacityKg,
        active: laveries.active,
        managerName: users.fullName,
      })
      .from(laveries)
      .leftJoin(users, eq(laveries.managerId, users.id))
      .orderBy(desc(laveries.createdAt));

    const activeRuns = await this.db
      .select({
        id: washingRuns.id,
        laverieName: laveries.name,
        dirtyWeightKg: washingRuns.dirtyWeightKg,
        waterLiters: washingRuns.waterLiters,
        waterTempC: washingRuns.waterTempC,
        startedAt: washingRuns.startedAt,
        operatorName: users.fullName,
      })
      .from(washingRuns)
      .leftJoin(laveries, eq(washingRuns.laverieId, laveries.id))
      .leftJoin(users, eq(washingRuns.operatedBy, users.id))
      .where(isNull(washingRuns.completedAt))
      .orderBy(desc(washingRuns.startedAt))
      .limit(6);

    const recentQualifications = await this.db
      .select({
        id: qualifications.id,
        grade: qualifications.grade,
        safetyStatus: qualifications.safetyStatus,
        fiberLengthMm: qualifications.fiberLengthMm,
        fiberDiameterMicron: qualifications.fiberDiameterMicron,
        performedAt: qualifications.performedAt,
        analystName: users.fullName,
      })
      .from(qualifications)
      .leftJoin(users, eq(qualifications.performedBy, users.id))
      .orderBy(desc(qualifications.performedAt))
      .limit(8);

    const [washRunCount] = await this.db
      .select({
        count: sql<number>`count(*)::int`,
      })
      .from(washingRuns);

    return {
      summary: {
        totalLaveries: facilities.length,
        activeLaveries: facilities.filter((facility) => facility.active).length,
        activeRuns: activeRuns.length,
        totalWashRuns: washRunCount?.count ?? 0,
        gradedLots: recentQualifications.length,
      },
      laveries: facilities,
      activeRuns,
      recentQualifications,
    };
  }
}
