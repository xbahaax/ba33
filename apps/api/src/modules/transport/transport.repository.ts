import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { desc, eq, inArray, or, sql } from 'drizzle-orm';
import { DATABASE_TOKEN } from '../../common/database/database.module';
import type { Database } from '../../common/database/client';
import { lots, transportJobs, transportJobLots, users } from '../../common/database/schema';
import { appendWorkflowEvent } from '../../common/workflow/workflow-events';
import { AdvanceTransportJobDto } from './dto/advance-transport-job.dto';

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

  async advanceJob(
    jobId: string,
    input: AdvanceTransportJobDto,
    actorId: string,
    actorType: string,
  ) {
    const [job] = await this.db
      .select({
        id: transportJobs.id,
        status: transportJobs.status,
        destinationId: transportJobs.destinationId,
        destinationType: transportJobs.destinationType,
      })
      .from(transportJobs)
      .where(eq(transportJobs.id, jobId))
      .limit(1);

    if (!job) {
      throw new NotFoundException('Job transport introuvable.');
    }

    const now = new Date();

    return this.db.transaction(async (tx) => {
      if (input.action === 'accept') {
        if (!['pending', 'assigned'].includes(job.status)) {
          throw new BadRequestException('Le job ne peut pas être accepté.');
        }

        await tx
          .update(transportJobs)
          .set({
            status: 'accepted',
            acceptedAt: now,
            updatedAt: now,
          })
          .where(eq(transportJobs.id, jobId));
      }

      if (input.action === 'start') {
        if (!['pending', 'assigned', 'accepted'].includes(job.status)) {
          throw new BadRequestException('Le job ne peut pas démarrer.');
        }

        await tx
          .update(transportJobs)
          .set({
            status: 'in_progress',
            acceptedAt: job.status === 'accepted' ? undefined : now,
            updatedAt: now,
          })
          .where(eq(transportJobs.id, jobId));
      }

      if (input.action === 'deliver') {
        if (!['accepted', 'in_progress'].includes(job.status)) {
          throw new BadRequestException('Le job ne peut pas être clôturé.');
        }

        const jobLots = await tx
          .select({
            lotId: transportJobLots.lotId,
            loadedWeightKg: transportJobLots.loadedWeightKg,
          })
          .from(transportJobLots)
          .where(eq(transportJobLots.jobId, jobId));

        await tx
          .update(transportJobs)
          .set({
            status: 'delivered',
            completedAt: now,
            updatedAt: now,
          })
          .where(eq(transportJobs.id, jobId));

        await tx
          .update(transportJobLots)
          .set({
            deliveredAt: now,
            deliveredWeightKg: sql`coalesce(${transportJobLots.deliveredWeightKg}, ${transportJobLots.loadedWeightKg})`,
          })
          .where(eq(transportJobLots.jobId, jobId));

        const lotIds = jobLots.map((row) => row.lotId);

        if (lotIds.length > 0) {
          await tx
            .update(lots)
            .set({
              currentLocationId: job.destinationId,
              currentLocationType: job.destinationType,
              updatedAt: now,
            })
            .where(inArray(lots.id, lotIds));
        }
      }

      await appendWorkflowEvent(tx, {
        aggregateId: jobId,
        aggregateType: 'transport_job',
        actorId,
        actorType,
        eventType:
          input.action === 'accept'
            ? 'transport_accepted'
            : input.action === 'start'
              ? 'transport_started'
              : 'transport_delivered',
        occurredAt: now,
        payload: {
          action: input.action,
          destinationId: job.destinationId,
          destinationType: job.destinationType,
        },
      });

      const [updatedJob] = await tx
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
          lotCount: sql<number>`count(${transportJobLots.lotId})::int`,
        })
        .from(transportJobs)
        .leftJoin(users, eq(transportJobs.transporterId, users.id))
        .leftJoin(transportJobLots, eq(transportJobs.id, transportJobLots.jobId))
        .where(eq(transportJobs.id, jobId))
        .groupBy(transportJobs.id, users.fullName)
        .limit(1);

      return updatedJob;
    });
  }
}
