import { Inject, Injectable } from '@nestjs/common';
import { desc, or, eq, sql, and } from 'drizzle-orm';
import { DATABASE_TOKEN } from '../../common/database/database.module';
import type { Database } from '../../common/database/client';
import {
  lots,
  lotPhotos,
  lotSignatures,
  lotWeighs,
  lotLineage,
} from '../../common/database/schema';

@Injectable()
export class LotsRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  // ── CRUD ────────────────────────────────────────────────

  async create(data: typeof lots.$inferInsert) {
    const [row] = await this.db.insert(lots).values(data).returning();
    return row;
  }

  async findById(id: string) {
    const [row] = await this.db
      .select()
      .from(lots)
      .where(eq(lots.id, id))
      .limit(1);
    return row ?? null;
  }

  async findByQrCode(qrCode: string) {
    const [row] = await this.db
      .select()
      .from(lots)
      .where(eq(lots.qrCode, qrCode))
      .limit(1);
    return row ?? null;
  }

  async findAll(filters?: {
    collectorId?: string;
    sourceType?: string;
    status?: string;
    isUrgent?: boolean;
  }) {
    const conditions: any[] = [];
    if (filters?.collectorId) conditions.push(eq(lots.collectorId, filters.collectorId));
    if (filters?.sourceType) conditions.push(eq(lots.sourceType, filters.sourceType as any));
    if (filters?.status) conditions.push(eq(lots.status, filters.status as any));
    if (filters?.isUrgent !== undefined) conditions.push(eq(lots.isUrgent, filters.isUrgent));

    let query = this.db.select().from(lots).orderBy(desc(lots.createdAt));
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    return query;
  }

  async update(id: string, data: Partial<typeof lots.$inferInsert>) {
    const [row] = await this.db
      .update(lots)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(lots.id, id))
      .returning();
    return row;
  }

  // ── Weighs ──────────────────────────────────────────────

  async addWeigh(data: typeof lotWeighs.$inferInsert) {
    const [row] = await this.db.insert(lotWeighs).values(data).returning();
    return row;
  }

  async getWeighs(lotId: string) {
    return this.db
      .select()
      .from(lotWeighs)
      .where(eq(lotWeighs.lotId, lotId))
      .orderBy(desc(lotWeighs.recordedAt));
  }

  async getLatestWeigh(lotId: string) {
    const [row] = await this.db
      .select()
      .from(lotWeighs)
      .where(eq(lotWeighs.lotId, lotId))
      .orderBy(desc(lotWeighs.recordedAt))
      .limit(1);
    return row ?? null;
  }

  // ── Photos ──────────────────────────────────────────────

  async addPhoto(data: typeof lotPhotos.$inferInsert) {
    const [row] = await this.db.insert(lotPhotos).values(data).returning();
    return row;
  }

  async getPhotos(lotId: string) {
    return this.db
      .select()
      .from(lotPhotos)
      .where(eq(lotPhotos.lotId, lotId));
  }

  // ── Signatures ──────────────────────────────────────────

  async addSignature(data: typeof lotSignatures.$inferInsert) {
    const [row] = await this.db.insert(lotSignatures).values(data).returning();
    return row;
  }

  async getSignatures(lotId: string) {
    return this.db
      .select()
      .from(lotSignatures)
      .where(eq(lotSignatures.lotId, lotId));
  }

  // ── Lineage ─────────────────────────────────────────────

  async addLineage(data: typeof lotLineage.$inferInsert) {
    const [row] = await this.db
      .insert(lotLineage)
      .values(data)
      .onConflictDoNothing()
      .returning();
    return row;
  }

  async getLineage(lotId: string) {
    const children = await this.db
      .select()
      .from(lotLineage)
      .where(eq(lotLineage.parentLotId, lotId));
    const parents = await this.db
      .select()
      .from(lotLineage)
      .where(eq(lotLineage.childLotId, lotId));
    return { children, parents };
  }

  // ── Summary ─────────────────────────────────────────────

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
