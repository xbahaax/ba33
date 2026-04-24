import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_TOKEN } from '../../common/database/database.module';
import type { Database } from '../../common/database/client';
import {
  transportJobs,
  transportJobLots,
  transportGpsPoints,
  transporters,
} from '../../common/database/schema';
import { eq, and, desc } from 'drizzle-orm';

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
}
