import { Inject, Injectable } from '@nestjs/common';
import { desc, eq, inArray, or, sql } from 'drizzle-orm';
import { DATABASE_TOKEN } from '../../common/database/database.module';
import type { Database } from '../../common/database/client';
import { transportJobs, transportJobLots, users } from '../../common/database/schema';

@Injectable()
export class TransportRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async getOverview() {
    const statusBreakdown = await this.db
      .select({
        status: transportJobs.status,
        count: sql<number>`count(*)::int`,
      })
      .from(transportJobs)
      .groupBy(transportJobs.status)
      .orderBy(transportJobs.status);

    const recentJobs = await this.db
      .select({
        id: transportJobs.id,
        status: transportJobs.status,
        lane: transportJobs.lane,
        originType: transportJobs.originType,
        destinationType: transportJobs.destinationType,
        requestedAt: transportJobs.requestedAt,
        acceptedAt: transportJobs.acceptedAt,
        completedAt: transportJobs.completedAt,
        slaDeadline: transportJobs.slaDeadline,
        transporterName: users.fullName,
      })
      .from(transportJobs)
      .leftJoin(users, eq(transportJobs.transporterId, users.id))
      .orderBy(desc(transportJobs.requestedAt))
      .limit(8);

    const [urgentJobs] = await this.db
      .select({
        count: sql<number>`count(*)::int`,
      })
      .from(transportJobs)
      .where(
        or(
          eq(transportJobs.lane, 'urgent_cold_chain'),
          eq(transportJobs.lane, 'urgent_standard'),
        ),
      );

    const jobIds = recentJobs.map((job) => job.id);
    const lotCounts =
      jobIds.length === 0
        ? []
        : await this.db
            .select({
              jobId: transportJobLots.jobId,
              lotCount: sql<number>`count(*)::int`,
            })
            .from(transportJobLots)
            .where(inArray(transportJobLots.jobId, jobIds))
            .groupBy(transportJobLots.jobId);

    const lotCountMap = new Map(lotCounts.map((row) => [row.jobId, row.lotCount]));
    const breakdownMap = new Map(statusBreakdown.map((row) => [row.status, row.count]));

    return {
      summary: {
        totalJobs: statusBreakdown.reduce((sum, row) => sum + row.count, 0),
        pendingJobs:
          (breakdownMap.get('pending') ?? 0) +
          (breakdownMap.get('assigned') ?? 0) +
          (breakdownMap.get('accepted') ?? 0),
        activeJobs: breakdownMap.get('in_progress') ?? 0,
        deliveredJobs: breakdownMap.get('delivered') ?? 0,
        cancelledJobs: breakdownMap.get('cancelled') ?? 0,
        urgentJobs: urgentJobs?.count ?? 0,
        statusBreakdown,
      },
      jobs: recentJobs.map((job) => ({
        ...job,
        lotCount: lotCountMap.get(job.id) ?? 0,
      })),
    };
  }
}
