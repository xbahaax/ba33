import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_TOKEN } from '../../common/database/database.module';
import type { Database } from '../../common/database/client';

@Injectable()
export class TransformationRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  // --- Transformers ---

  async createTransformer(data: {
    name: string;
    track: 'd3_textile' | 'd4_bio';
    regionId: string;
    address: string;
    dailyCapacityKg: string;
    managerId?: string;
  }) {
    const [transformer] = await this.db
      .insert(transformers)
      .values(data)
      .returning();
    return transformer;
  }

  async findTransformerById(id: string) {
    const [transformer] = await this.db
      .select()
      .from(transformers)
      .where(eq(transformers.id, id));
    return transformer ?? null;
  }

  async findAllTransformers(track?: 'd3_textile' | 'd4_bio') {
    const conditions = [];
    if (track) {
      conditions.push(eq(transformers.track, track));
    }
    conditions.push(eq(transformers.active, true));

    return this.db
      .select()
      .from(transformers)
      .where(and(...conditions))
      .orderBy(desc(transformers.createdAt));
  }

  // --- BOMs ---

  async createBom(data: {
    transformerId: string;
    productTypeCode: string;
    productName: string;
    inputWoolKgPerUnit: string;
    additives?: unknown;
    expectedYieldPercent: string;
    version: number;
  }) {
    const [bom] = await this.db.insert(boms).values(data).returning();
    return bom;
  }

  async findBomsByTransformer(transformerId: string) {
    return this.db
      .select()
      .from(boms)
      .where(
        and(eq(boms.transformerId, transformerId), eq(boms.active, true)),
      )
      .orderBy(desc(boms.createdAt));
  }

  async findBomById(id: string) {
    const [bom] = await this.db
      .select()
      .from(boms)
      .where(eq(boms.id, id));
    return bom ?? null;
  }

  // --- Production Runs ---

  async createProductionRun(data: {
    transformerId: string;
    bomId: string;
    bomVersion: number;
    inputWeightKg: string;
    startedAt: Date;
    operatedBy: string;
  }) {
    const [run] = await this.db
      .insert(productionRuns)
      .values(data)
      .returning();
    return run;
  }

  async updateProductionRun(
    id: string,
    data: {
      inputWeightKg?: string;
      outputWeightKg?: string;
      wasteWeightKg?: string;
      yieldPercent?: string;
      completedAt?: Date;
    },
  ) {
    const [run] = await this.db
      .update(productionRuns)
      .set(data)
      .where(eq(productionRuns.id, id))
      .returning();
    return run;
  }

  async findProductionRun(id: string) {
    const [run] = await this.db
      .select()
      .from(productionRuns)
      .where(eq(productionRuns.id, id));
    return run ?? null;
  }

  async findProductionRunsByTransformer(transformerId: string) {
    return this.db
      .select()
      .from(productionRuns)
      .where(eq(productionRuns.transformerId, transformerId))
      .orderBy(desc(productionRuns.startedAt));
  }

  // --- Production Run Lots ---

  async addRunLot(runId: string, lotId: string, weightUsed: string) {
    const [runLot] = await this.db
      .insert(productionRunLots)
      .values({
        runId,
        lotId,
        weightUsedKg: weightUsed,
      })
      .returning();
    return runLot;
  }

  async findRunLots(runId: string) {
    return this.db
      .select()
      .from(productionRunLots)
      .where(eq(productionRunLots.runId, runId));
  }

  // --- Products ---

  async createProduct(data: {
    productionRunId: string;
    productCode: string;
    productTypeCode: string;
    track: 'd3_textile' | 'd4_bio';
    quantity: string;
    unit: string;
    weightKg: string;
    status?: 'in_production' | 'produced' | 'certified' | 'sold' | 'shipped' | 'delivered' | 'rejected';
    certificationId?: string;
  }) {
    const [product] = await this.db
      .insert(products)
      .values(data)
      .returning();
    return product;
  }

  async findProductById(id: string) {
    const [product] = await this.db
      .select()
      .from(products)
      .where(eq(products.id, id));
    return product ?? null;
  }

  async findProductByCode(code: string) {
    const [product] = await this.db
      .select()
      .from(products)
      .where(eq(products.productCode, code));
    return product ?? null;
  }

  async findProducts(filters?: {
    track?: 'd3_textile' | 'd4_bio';
    status?: string;
    productionRunId?: string;
  }) {
    const conditions = [];
    if (filters?.track) {
      conditions.push(eq(products.track, filters.track));
    }
    if (filters?.status) {
      conditions.push(eq(products.status, filters.status as any));
    }
    if (filters?.productionRunId) {
      conditions.push(eq(products.productionRunId, filters.productionRunId));
    }

    return this.db
      .select()
      .from(products)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(products.createdAt));
  }

  async updateProduct(
    id: string,
    data: {
      status?: 'in_production' | 'produced' | 'certified' | 'sold' | 'shipped' | 'delivered' | 'rejected';
      certificationId?: string;
      updatedAt?: Date;
    },
  ) {
    const [product] = await this.db
      .update(products)
      .set(data)
      .where(eq(products.id, id))
      .returning();
    return product;
  }

  // --- Waste Records ---

  async createWasteRecord(data: {
    productionRunId?: string;
    washingRunId?: string;
    amountKg: string;
    category: 'reusable' | 'recoverable' | 'disposal';
    destination?: string;
    recordedBy: string;
    recordedAt: Date;
  }) {
    const [record] = await this.db
      .insert(wasteRecords)
      .values(data)
      .returning();
    return record;
  }

  async findWasteByRun(runId: string) {
    return this.db
      .select()
      .from(wasteRecords)
      .where(eq(wasteRecords.productionRunId, runId));
  }
}
