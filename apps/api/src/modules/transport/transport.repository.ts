import { BadRequestException, Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DATABASE_TOKEN } from '../../common/database/database.module';
import type { Database } from '../../common/database/client';
import {
  transportJobs,
  transportJobLots,
  transportGpsPoints,
  transporters,
  users,
  preLots,
  lots,
} from '../../common/database/schema';
import { eq, and, desc, inArray, or, sql } from 'drizzle-orm';
import { appendWorkflowEvent } from '../../common/workflow/workflow-events';
import { AdvanceTransportJobDto } from './dto/advance-transport-job.dto';

@Injectable()
export class TransportRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  // ── Jobs ──────────────────────────────────────────────────

  async createJob(data: typeof transportJobs.$inferInsert) {
    const [row] = await this.db
      .insert(transportJobs)
      .values(data)
      .returning();
    return row;
  }

  async findJobById(id: string) {
    const [row] = await this.db
      .select()
      .from(transportJobs)
      .where(eq(transportJobs.id, id));
    return row ?? null;
  }

  async findJobs(filters?: {
    transporterId?: string;
    status?: string;
    lane?: string;
  }) {
    const conditions: ReturnType<typeof eq>[] = [];

    if (filters?.transporterId) {
      conditions.push(
        eq(transportJobs.transporterId, filters.transporterId),
      );
    }
    if (filters?.status) {
      conditions.push(eq(transportJobs.status, filters.status as any));
    }
    if (filters?.lane) {
      conditions.push(eq(transportJobs.lane, filters.lane as any));
    }

    const query = this.db.select().from(transportJobs);

    if (conditions.length > 0) {
      return query
        .where(and(...conditions))
        .orderBy(desc(transportJobs.createdAt));
    }

    return query.orderBy(desc(transportJobs.createdAt));
  }

  async updateJob(
    id: string,
    data: Partial<typeof transportJobs.$inferInsert>,
  ) {
    const [row] = await this.db
      .update(transportJobs)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(transportJobs.id, id))
      .returning();
    return row ?? null;
  }

  // ── Job Lots ──────────────────────────────────────────────

  async addJobLot(jobId: string, lotId: string) {
    const [row] = await this.db
      .insert(transportJobLots)
      .values({ jobId, lotId })
      .returning();
    return row;
  }

  async updateJobLot(
    jobId: string,
    lotId: string,
    data: Partial<typeof transportJobLots.$inferInsert>,
  ) {
    const [row] = await this.db
      .update(transportJobLots)
      .set(data)
      .where(
        and(
          eq(transportJobLots.jobId, jobId),
          eq(transportJobLots.lotId, lotId),
        ),
      )
      .returning();
    return row ?? null;
  }

  async findJobLots(jobId: string) {
    return this.db
      .select()
      .from(transportJobLots)
      .where(eq(transportJobLots.jobId, jobId));
  }

  // ── GPS Points ────────────────────────────────────────────

  async addGpsPoint(data: typeof transportGpsPoints.$inferInsert) {
    const [row] = await this.db
      .insert(transportGpsPoints)
      .values(data)
      .returning();
    return row;
  }

  async findGpsPoints(jobId: string) {
    return this.db
      .select()
      .from(transportGpsPoints)
      .where(eq(transportGpsPoints.jobId, jobId))
      .orderBy(transportGpsPoints.recordedAt);
  }

  // ── Transporters ──────────────────────────────────────────

  async createTransporter(data: typeof transporters.$inferInsert) {
    const [row] = await this.db
      .insert(transporters)
      .values(data)
      .returning();
    return row;
  }

  async findTransporterByUserId(userId: string) {
    const [row] = await this.db
      .select()
      .from(transporters)
      .where(eq(transporters.userId, userId));
    return row ?? null;
  }

  async findPreLotForJob(sourceId: string, jobCreatedAt: Date | string) {
    // Find the pre-lot created just before the job (the one that triggered it)
    const jobTime = new Date(jobCreatedAt);
    const windowStart = new Date(jobTime.getTime() - 5000); // 5s before
    const rows = await this.db
      .select()
      .from(preLots)
      .where(eq(preLots.sourceId, sourceId))
      .orderBy(desc(preLots.createdAt));

    // Return the pre-lot whose createdAt is closest to (but before) the job's createdAt
    for (const row of rows) {
      const plTime = new Date(row.createdAt);
      if (plTime >= windowStart && plTime <= jobTime) {
        return row;
      }
    }
    // Fallback: return the most recent pre-lot before the job
    return rows.find((r) => new Date(r.createdAt) <= jobTime) ?? rows[0] ?? null;
  }

  async findActiveTransportersByRegion(regionId: string) {
    return this.db
      .select({ userId: transporters.userId })
      .from(transporters)
      .innerJoin(users, eq(users.id, transporters.userId))
      .where(
        and(
          eq(transporters.active, true),
          eq(users.regionId, regionId),
        ),
      )
      .limit(1);
  }

  async completePreLot(preLotId: string, lotId: string) {
    const [row] = await this.db
      .update(preLots)
      .set({
        status: 'collected' as any,
        lotId,
        updatedAt: new Date(),
      })
      .where(eq(preLots.id, preLotId))
      .returning();
    return row ?? null;
  }

  async getOverview() {
    const statusBreakdown = await this.db
      .select({ status: transportJobs.status, count: sql<number>`count(*)::int` })
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
      .select({ count: sql<number>`count(*)::int` })
      .from(transportJobs)
      .where(or(eq(transportJobs.lane, 'urgent_cold_chain'), eq(transportJobs.lane, 'urgent_standard')));

    const jobIds = recentJobs.map((j) => j.id);
    const lotCounts = jobIds.length === 0 ? [] : await this.db
      .select({ jobId: transportJobLots.jobId, lotCount: sql<number>`count(*)::int` })
      .from(transportJobLots)
      .where(inArray(transportJobLots.jobId, jobIds))
      .groupBy(transportJobLots.jobId);

    const lotMap = new Map(lotCounts.map((r) => [r.jobId, r.lotCount]));
    const breakdownMap = new Map(statusBreakdown.map((r) => [r.status, r.count]));

    return {
      summary: {
        totalJobs: statusBreakdown.reduce((s, r) => s + r.count, 0),
        pendingJobs: (breakdownMap.get('pending') ?? 0) + (breakdownMap.get('assigned') ?? 0) + (breakdownMap.get('accepted') ?? 0),
        activeJobs: breakdownMap.get('in_progress') ?? 0,
        deliveredJobs: breakdownMap.get('delivered') ?? 0,
        cancelledJobs: breakdownMap.get('cancelled') ?? 0,
        urgentJobs: urgentJobs?.count ?? 0,
        statusBreakdown,
      },
      jobs: recentJobs.map((j) => ({ ...j, lotCount: lotMap.get(j.id) ?? 0 })),
    };
  }

  async advanceJob(jobId: string, input: AdvanceTransportJobDto, actorId: string, actorType: string) {
    const [job] = await this.db
      .select({ id: transportJobs.id, status: transportJobs.status, destinationId: transportJobs.destinationId, destinationType: transportJobs.destinationType })
      .from(transportJobs)
      .where(eq(transportJobs.id, jobId))
      .limit(1);

    if (!job) throw new NotFoundException('Job transport introuvable.');

    const now = new Date();

    return this.db.transaction(async (tx) => {
      if (input.action === 'accept') {
        if (!['pending', 'assigned'].includes(job.status)) throw new BadRequestException('Le job ne peut pas être accepté.');
        await tx.update(transportJobs).set({ status: 'accepted', acceptedAt: now, updatedAt: now }).where(eq(transportJobs.id, jobId));
      }

      if (input.action === 'start') {
        if (!['pending', 'assigned', 'accepted'].includes(job.status)) throw new BadRequestException('Le job ne peut pas démarrer.');
        await tx.update(transportJobs).set({ status: 'in_progress', updatedAt: now }).where(eq(transportJobs.id, jobId));
      }

      if (input.action === 'deliver') {
        if (!['accepted', 'in_progress'].includes(job.status)) throw new BadRequestException('Le job ne peut pas être clôturé.');
        const jobLots = await tx.select({ lotId: transportJobLots.lotId }).from(transportJobLots).where(eq(transportJobLots.jobId, jobId));
        await tx.update(transportJobs).set({ status: 'delivered', completedAt: now, updatedAt: now }).where(eq(transportJobs.id, jobId));
        await tx.update(transportJobLots).set({ deliveredAt: now, deliveredWeightKg: sql`coalesce(${transportJobLots.deliveredWeightKg}, ${transportJobLots.loadedWeightKg})` }).where(eq(transportJobLots.jobId, jobId));
        const lotIds = jobLots.map((r) => r.lotId);
        if (lotIds.length > 0) {
          await tx.update(lots).set({ currentLocationId: job.destinationId, currentLocationType: job.destinationType, updatedAt: now }).where(inArray(lots.id, lotIds));
        }
      }

      await appendWorkflowEvent(tx, {
        aggregateId: jobId, aggregateType: 'transport_job',
        actorId, actorType,
        eventType: input.action === 'accept' ? 'transport_accepted' : input.action === 'start' ? 'transport_started' : 'transport_delivered',
        payload: { action: input.action, destinationId: job.destinationId, destinationType: job.destinationType },
      });

      const [updated] = await tx
        .select({ id: transportJobs.id, status: transportJobs.status, lane: transportJobs.lane, requestedAt: transportJobs.requestedAt, completedAt: transportJobs.completedAt })
        .from(transportJobs).where(eq(transportJobs.id, jobId)).limit(1);
      return updated;
    });
  }
}
