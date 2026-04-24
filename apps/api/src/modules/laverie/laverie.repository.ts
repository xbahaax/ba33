import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_TOKEN } from '../../common/database/database.module';
import type { Database } from '../../common/database/client';

@Injectable()
export class LaverieRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async createLaverie(data: {
    id: string;
    name: string;
    regionId: string;
    address: string;
    dailyCapacityKg: string;
    managerId?: string;
    active?: boolean;
  }) {
    const [laverie] = await this.db.insert(laveries).values(data).returning();
    return laverie;
  }

  async findLaverieById(id: string) {
    const [laverie] = await this.db
      .select()
      .from(laveries)
      .where(eq(laveries.id, id))
      .limit(1);
    return laverie ?? null;
  }

  async findAllLaveries() {
    return this.db.select().from(laveries).orderBy(desc(laveries.createdAt));
  }

  async createReception(data: {
    id: string;
    laverieId: string;
    lotId: string;
    depotDispatchId?: string;
    receivedWeightKg: string;
    receivedBy: string;
    receivedAt: Date;
  }) {
    const [reception] = await this.db
      .insert(laverieReceptions)
      .values(data)
      .returning();
    return reception;
  }

  async createPreWashCheck(data: {
    id: string;
    lotId: string;
    vetCertReference?: string;
    visualInspectionPassed: boolean;
    contaminationDetected: boolean;
    action: 'approved' | 'quarantined' | 'rejected';
    performedBy: string;
    performedAt: Date;
  }) {
    const [check] = await this.db.insert(preWashChecks).values(data).returning();
    return check;
  }

  async createWashingRun(data: {
    id: string;
    laverieId: string;
    lotId: string;
    dirtyWeightKg: string;
    operatedBy: string;
    startedAt: Date;
  }) {
    const [run] = await this.db.insert(washingRuns).values(data).returning();
    return run;
  }

  async updateWashingRun(
    id: string,
    data: Partial<{
      cleanWeightKg: string;
      yieldPercent: string;
      waterLiters: string;
      chemicals: unknown;
      cycleDurationMinutes: number;
      waterTempC: string;
      completedAt: Date;
    }>,
  ) {
    const [run] = await this.db
      .update(washingRuns)
      .set(data)
      .where(eq(washingRuns.id, id))
      .returning();
    return run;
  }

  async createQualification(data: {
    id: string;
    lotId: string;
    washingRunId: string;
    fiberLengthMm?: string;
    fiberDiameterMicron?: string;
    moisturePercent?: string;
    cleanlinessScore?: number;
    color?: string;
    grade: 'A' | 'B' | 'C' | 'reject';
    safetyStatus: 'clear' | 'flagged' | 'rejected';
    contaminationNotes?: string;
    performedBy: string;
    performedAt: Date;
  }) {
    const [qualification] = await this.db
      .insert(qualifications)
      .values(data)
      .returning();
    return qualification;
  }

  async createPricingProposal(data: {
    id: string;
    lotId: string;
    qualificationId: string;
    basePricePerKg: string;
    urgencyDiscountPercent: string;
    sourceTypeAdjustmentPercent: string;
    finalPricePerKg: string;
    totalValue: string;
    computedAt: Date;
  }) {
    const [proposal] = await this.db
      .insert(pricingProposals)
      .values(data)
      .returning();
    return proposal;
  }

  async createDispatch(data: {
    id: string;
    lotId: string;
    qualificationId: string;
    track: 'd3_textile' | 'd4_bio' | 'quarantine' | 'reject';
    targetTransformerId?: string;
    ruleVersion: number;
    dispatchedBy?: string;
    dispatchedAt: Date;
  }) {
    const [dispatch] = await this.db
      .insert(laverieDispatches)
      .values(data)
      .returning();
    return dispatch;
  }

  async findWashingRuns(laverieId?: string, lotId?: string) {
    const conditions: ReturnType<typeof eq>[] = [];
    if (laverieId) {
      conditions.push(eq(washingRuns.laverieId, laverieId));
    }
    if (lotId) {
      conditions.push(eq(washingRuns.lotId, lotId));
    }
    const query = this.db.select().from(washingRuns);
    if (conditions.length > 0) {
      return query
        .where(and(...conditions))
        .orderBy(desc(washingRuns.startedAt));
    }
    return query.orderBy(desc(washingRuns.startedAt));
  }

  async findQualifications(lotId?: string) {
    if (lotId) {
      return this.db
        .select()
        .from(qualifications)
        .where(eq(qualifications.lotId, lotId))
        .orderBy(desc(qualifications.performedAt));
    }
    return this.db
      .select()
      .from(qualifications)
      .orderBy(desc(qualifications.performedAt));
  }

  async findQualificationById(id: string) {
    const [qualification] = await this.db
      .select()
      .from(qualifications)
      .where(eq(qualifications.id, id))
      .limit(1);
    return qualification ?? null;
  }

  async findWashingRunById(id: string) {
    const [run] = await this.db
      .select()
      .from(washingRuns)
      .where(eq(washingRuns.id, id))
      .limit(1);
    return run ?? null;
  }
}
