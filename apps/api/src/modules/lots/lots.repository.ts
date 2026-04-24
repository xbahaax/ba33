import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_TOKEN } from '../../common/database/database.module';
import type { Database } from '../../common/database/client';
import {
  lots,
  lotPhotos,
  lotSignatures,
  lotWeighs,
  lotLineage,
} from '../../common/database/schema';
import { eq, and, or, desc } from 'drizzle-orm';

@Injectable()
export class LotsRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async create(data: {
    id?: string;
    sourceId: string;
    sourceType?: 'c1_shepherd' | 'c2_slaughterhouse' | 'c3_aggregator';
    collectorId?: string;
    qrCode: string;
    declaredWeightKg?: string;
    actualWeightKg?: string;
    stateQuick?: 'clean' | 'dirty' | 'very_dirty' | 'contaminated' | 'with_meat';
    urgency?: 'normal' | 'urgent';
    coldChainTempC?: string;
    gpsLat?: string;
    gpsLng?: string;
    status: any;
    isUrgent?: boolean;
    collectedAt?: Date;
    preLotId?: string;
    routeStopId?: string;
    currentLocationId?: string;
    currentLocationType?: string;
    notes?: string;
    voiceNoteId?: string;
  }) {
    const [lot] = await this.db.insert(lots).values(data).returning();
    return lot;
  }

  async findById(id: string) {
    const [lot] = await this.db.select().from(lots).where(eq(lots.id, id));
    return lot ?? null;
  }

  async findAll(filters?: {
    collectorId?: string;
    sourceType?: 'c1_shepherd' | 'c2_slaughterhouse' | 'c3_aggregator';
    status?: string;
    isUrgent?: boolean;
  }) {
    const conditions = [];

    if (filters?.collectorId) {
      conditions.push(eq(lots.collectorId, filters.collectorId));
    }
    if (filters?.sourceType) {
      conditions.push(eq(lots.sourceType, filters.sourceType));
    }
    if (filters?.status) {
      conditions.push(eq(lots.status, filters.status as any));
    }
    if (filters?.isUrgent !== undefined) {
      conditions.push(eq(lots.isUrgent, filters.isUrgent));
    }

    const query = this.db.select().from(lots);

    if (conditions.length > 0) {
      return query.where(and(...conditions)).orderBy(desc(lots.createdAt));
    }

    return query.orderBy(desc(lots.createdAt));
  }

  async update(
    id: string,
    data: Partial<{
      status: string;
      actualWeightKg: string;
      stateQuick: string;
      urgency: string;
      coldChainTempC: string;
      gpsLat: string;
      gpsLng: string;
      isUrgent: boolean;
      currentLocationId: string;
      currentLocationType: string;
      notes: string;
    }>,
  ) {
    const [updated] = await this.db
      .update(lots)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(lots.id, id))
      .returning();
    return updated ?? null;
  }

  async findByCollector(collectorId: string) {
    return this.db
      .select()
      .from(lots)
      .where(eq(lots.collectorId, collectorId))
      .orderBy(desc(lots.createdAt));
  }

  async findByQrCode(qrCode: string) {
    const [lot] = await this.db
      .select()
      .from(lots)
      .where(eq(lots.qrCode, qrCode));
    return lot ?? null;
  }

  async addPhoto(data: {
    lotId: string;
    fileId: string;
    angle?: 'overview' | 'closeup' | 'surroundings' | 'other';
    capturedAt?: Date;
    gpsLat?: string;
    gpsLng?: string;
  }) {
    const [photo] = await this.db
      .insert(lotPhotos)
      .values(data)
      .returning();
    return photo;
  }

  async addSignature(data: {
    lotId: string;
    type?: 'digital' | 'thumbprint' | 'paper_photo';
    fileId: string;
    signedByName?: string;
    capturedAt?: Date;
  }) {
    const [signature] = await this.db
      .insert(lotSignatures)
      .values(data)
      .returning();
    return signature;
  }

  async addWeigh(data: {
    lotId: string;
    phase: string;
    weightKg: string;
    source?: 'scale_bluetooth' | 'manual' | 'estimated';
    recordedBy?: string;
    recordedAt?: Date;
    eventId?: string;
  }) {
    const [weigh] = await this.db
      .insert(lotWeighs)
      .values(data)
      .returning();
    return weigh;
  }

  async getPhotos(lotId: string) {
    return this.db
      .select()
      .from(lotPhotos)
      .where(eq(lotPhotos.lotId, lotId))
      .orderBy(desc(lotPhotos.capturedAt));
  }

  async getSignatures(lotId: string) {
    return this.db
      .select()
      .from(lotSignatures)
      .where(eq(lotSignatures.lotId, lotId))
      .orderBy(desc(lotSignatures.capturedAt));
  }

  async getWeighs(lotId: string) {
    return this.db
      .select()
      .from(lotWeighs)
      .where(eq(lotWeighs.lotId, lotId))
      .orderBy(desc(lotWeighs.recordedAt));
  }

  // ── Lineage ──────────────────────────────────────────────

  async addLineage(data: {
    id: string;
    childLotId: string;
    parentLotId: string;
    weightContributionKg?: string;
    operation: 'split' | 'merge';
    performedBy?: string;
    performedAt: Date;
    notes?: string;
  }) {
    const [record] = await this.db
      .insert(lotLineage)
      .values(data)
      .returning();
    return record;
  }

  async getLineage(lotId: string) {
    return this.db
      .select()
      .from(lotLineage)
      .where(
        or(
          eq(lotLineage.parentLotId, lotId),
          eq(lotLineage.childLotId, lotId),
        ),
      )
      .orderBy(desc(lotLineage.performedAt));
  }

  async getLatestWeigh(lotId: string) {
    const [weigh] = await this.db
      .select()
      .from(lotWeighs)
      .where(eq(lotWeighs.lotId, lotId))
      .orderBy(desc(lotWeighs.recordedAt))
      .limit(1);
    return weigh ?? null;
  }
}
