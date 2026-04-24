import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, desc, eq, inArray, isNull, sql } from 'drizzle-orm';
import { DATABASE_TOKEN } from '../../common/database/database.module';
import type { Database } from '../../common/database/client';
import {
  boms,
  certifications,
  lots,
  products,
  productionRunLots,
  productionRuns,
  transformers,
  users,
  wasteRecords,
} from '../../common/database/schema';
import { appendWorkflowEvent } from '../../common/workflow/workflow-events';
import { CompleteProductionRunDto } from './dto/complete-production-run.dto';
import { CreateProductionRunDto } from './dto/create-production-run.dto';

@Injectable()
export class TransformationRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async getOverview() {
    const [facilities, activeRuns, recentProducts, runCount, dispatchQueue, bomRows] =
      await Promise.all([
        this.db
          .select({
            id: transformers.id,
            name: transformers.name,
            track: transformers.track,
            address: transformers.address,
            dailyCapacityKg: transformers.dailyCapacityKg,
            active: transformers.active,
            managerName: users.fullName,
          })
          .from(transformers)
          .leftJoin(users, eq(transformers.managerId, users.id))
          .orderBy(desc(transformers.createdAt)),
        this.db
          .select({
            id: productionRuns.id,
            transformerName: transformers.name,
            inputWeightKg: productionRuns.inputWeightKg,
            outputWeightKg: productionRuns.outputWeightKg,
            startedAt: productionRuns.startedAt,
            operatorName: users.fullName,
            // Stage 6 — Engrais direct
            drynessIndex: productionRuns.drynessIndex,
            foreignBodyPresent: productionRuns.foreignBodyPresent,
            unloadingMode: productionRuns.unloadingMode,
            // Stage 8 — Isolants/Géotextiles
            productDestinationType: productionRuns.productDestinationType,
            targetThicknessMm: productionRuns.targetThicknessMm,
            targetDensityKgM3: productionRuns.targetDensityKgM3,
            antimitesTreatmentType: productionRuns.antimitesTreatmentType,
            bindingFiberPercent: productionRuns.bindingFiberPercent,
            fireRetardantProduct: productionRuns.fireRetardantProduct,
          })
          .from(productionRuns)
          .leftJoin(transformers, eq(productionRuns.transformerId, transformers.id))
          .leftJoin(users, eq(productionRuns.operatedBy, users.id))
          .where(isNull(productionRuns.completedAt))
          .orderBy(desc(productionRuns.startedAt))
          .limit(6),
        this.db
          .select({
            id: products.id,
            productCode: products.productCode,
            productTypeCode: products.productTypeCode,
            track: products.track,
            quantity: products.quantity,
            weightKg: products.weightKg,
            status: products.status,
            createdAt: products.createdAt,
          })
          .from(products)
          .orderBy(desc(products.createdAt))
          .limit(8),
        this.db
          .select({
            count: sql<number>`count(*)::int`,
          })
          .from(productionRuns),
        this.db
          .select({
            id: lots.id,
            qrCode: lots.qrCode,
            status: lots.status,
            weightKg: lots.actualWeightKg,
            transformerId: lots.currentLocationId,
            transformerName: transformers.name,
            track: transformers.track,
          })
          .from(lots)
          .leftJoin(transformers, eq(lots.currentLocationId, transformers.id))
          .where(inArray(lots.status, ['dispatched_to_d3', 'dispatched_to_d4']))
          .orderBy(desc(lots.updatedAt))
          .limit(8),
        this.db
          .select({
            id: boms.id,
            transformerId: boms.transformerId,
            transformerName: transformers.name,
            track: transformers.track,
            productTypeCode: boms.productTypeCode,
            productName: boms.productName,
            version: boms.version,
            inputWoolKgPerUnit: boms.inputWoolKgPerUnit,
            expectedYieldPercent: boms.expectedYieldPercent,
          })
          .from(boms)
          .leftJoin(transformers, eq(boms.transformerId, transformers.id))
          .where(eq(boms.active, true))
          .orderBy(transformers.name, boms.productName),
      ]);

    return {
      summary: {
        totalTransformers: facilities.length,
        activeTransformers: facilities.filter((facility) => facility.active).length,
        activeRuns: activeRuns.length,
        totalRuns: runCount[0]?.count ?? 0,
        recentProducts: recentProducts.length,
      },
      transformers: facilities,
      activeRuns,
      recentProducts,
      dispatchQueue,
      boms: bomRows,
    };
  }

  async startProductionRun(
    input: CreateProductionRunDto,
    actorId: string,
    actorType: string,
  ) {
    const [lot] = await this.db
      .select({
        id: lots.id,
        qrCode: lots.qrCode,
        status: lots.status,
      })
      .from(lots)
      .where(eq(lots.id, input.lotId))
      .limit(1);

    if (!lot) {
      throw new NotFoundException('Lot introuvable.');
    }

    if (!['dispatched_to_d3', 'dispatched_to_d4'].includes(lot.status)) {
      throw new BadRequestException('Le lot n’est pas prêt pour une transformation.');
    }

    const [bom] = await this.db
      .select({
        id: boms.id,
        transformerId: boms.transformerId,
        version: boms.version,
      })
      .from(boms)
      .where(eq(boms.id, input.bomId))
      .limit(1);

    if (!bom || bom.transformerId !== input.transformerId) {
      throw new BadRequestException('Le BOM sélectionné n’appartient pas au transformateur.');
    }

    const [existingRun] = await this.db
      .select({ id: productionRuns.id })
      .from(productionRuns)
      .innerJoin(productionRunLots, eq(productionRuns.id, productionRunLots.runId))
      .where(
        and(
          eq(productionRunLots.lotId, input.lotId),
          isNull(productionRuns.completedAt),
        ),
      )
      .limit(1);

    if (existingRun) {
      throw new BadRequestException('Un run actif utilise déjà ce lot.');
    }

    const startedAt = new Date();

    return this.db.transaction(async (tx) => {
      const [run] = await tx
        .insert(productionRuns)
        .values({
          transformerId: input.transformerId,
          bomId: input.bomId,
          bomVersion: bom.version,
          inputWeightKg: input.inputWeightKg.toFixed(2),
          startedAt,
          operatedBy: actorId,
          // Stage 6 — Entrée Transformateur 2 (Engrais direct)
          drynessIndex: input.drynessIndex?.toFixed(2),
          foreignBodyPresent: input.foreignBodyPresent,
          foreignBodyNotes: input.foreignBodyNotes,
          unloadingMode: input.unloadingMode,
          // Stage 8 — Entrée Transformateur 1 (Isolants/Géotextiles)
          productDestinationType: input.productDestinationType,
          targetThicknessMm: input.targetThicknessMm?.toFixed(2),
          targetDensityKgM3: input.targetDensityKgM3?.toFixed(3),
          antimitesTreatmentType: input.antimitesTreatmentType,
          bindingFiberPercent: input.bindingFiberPercent?.toFixed(2),
          fireRetardantProduct: input.fireRetardantProduct,
        })
        .returning({
          id: productionRuns.id,
          startedAt: productionRuns.startedAt,
        });

      await tx.insert(productionRunLots).values({
        runId: run.id,
        lotId: input.lotId,
        weightUsedKg: input.inputWeightKg.toFixed(2),
      });

      await tx
        .update(lots)
        .set({
          currentLocationId: input.transformerId,
          currentLocationType: 'transformer',
          status: 'in_transformation',
          updatedAt: startedAt,
        })
        .where(eq(lots.id, input.lotId));

      await appendWorkflowEvent(tx, {
        aggregateId: run.id,
        aggregateType: 'production_run',
        actorId,
        actorType,
        eventType: 'production_started',
        occurredAt: startedAt,
        payload: {
          bomId: input.bomId,
          inputWeightKg: input.inputWeightKg,
          lotId: input.lotId,
          lotQrCode: lot.qrCode,
          transformerId: input.transformerId,
        },
      });

      return {
        id: run.id,
        lotId: input.lotId,
        status: 'in_transformation',
        startedAt: run.startedAt,
      };
    });
  }

  async completeProductionRun(
    runId: string,
    input: CompleteProductionRunDto,
    actorId: string,
    actorType: string,
  ) {
    const [run] = await this.db
      .select({
        id: productionRuns.id,
        transformerId: productionRuns.transformerId,
        bomId: productionRuns.bomId,
        inputWeightKg: productionRuns.inputWeightKg,
        completedAt: productionRuns.completedAt,
        track: transformers.track,
        productTypeCode: boms.productTypeCode,
      })
      .from(productionRuns)
      .leftJoin(transformers, eq(productionRuns.transformerId, transformers.id))
      .leftJoin(boms, eq(productionRuns.bomId, boms.id))
      .where(eq(productionRuns.id, runId))
      .limit(1);

    if (!run) {
      throw new NotFoundException('Run de transformation introuvable.');
    }

    if (run.completedAt) {
      throw new BadRequestException('Ce run est déjà clôturé.');
    }

    if (!run.track || !run.productTypeCode) {
      throw new BadRequestException('Le run est incomplet: track ou type produit manquant.');
    }

    const track = run.track;
    const productTypeCode = run.productTypeCode;

    const lotRows = await this.db
      .select({
        lotId: productionRunLots.lotId,
      })
      .from(productionRunLots)
      .where(eq(productionRunLots.runId, runId));

    const yieldPercent =
      Number(run.inputWeightKg ?? 0) > 0
        ? (input.outputWeightKg / Number(run.inputWeightKg)) * 100
        : 0;
    const completedAt = new Date();
    const prefix = track === 'd4_bio' ? 'P2' : 'P1';

    const [productCount] = await this.db
      .select({
        count: sql<number>`count(*)::int`,
      })
      .from(products)
      .where(eq(products.track, track));

    const generatedProductCode = `${prefix}-AUTO-${String(
      (productCount?.count ?? 0) + 1,
    ).padStart(4, '0')}`;
    const productCode = input.productCode?.trim() || generatedProductCode;

    return this.db.transaction(async (tx) => {
      await tx
        .update(productionRuns)
        .set({
          outputWeightKg: input.outputWeightKg.toFixed(2),
          wasteWeightKg: input.wasteWeightKg.toFixed(2),
          yieldPercent: yieldPercent.toFixed(2),
          completedAt,
        })
        .where(eq(productionRuns.id, runId));

      const [product] = await tx
        .insert(products)
        .values({
          productionRunId: runId,
          productCode,
          productTypeCode,
          track,
          quantity: input.quantity.toFixed(2),
          unit: input.unit?.trim() || 'unités',
          weightKg: input.outputWeightKg.toFixed(2),
          status: 'produced',
          createdAt: completedAt,
          updatedAt: completedAt,
        })
        .returning({
          id: products.id,
          productCode: products.productCode,
          createdAt: products.createdAt,
        });

      const [certification] = await tx
        .insert(certifications)
        .values({
          productId: product.id,
          productCode,
          status: 'pending',
          gatesPassed: {
            traceability: true,
            qualification: true,
            packaging: false,
          },
          qrCodeUrl: `https://example.local/cert/${product.id}`,
          createdAt: completedAt,
          updatedAt: completedAt,
        })
        .returning({
          id: certifications.id,
        });

      await tx
        .update(products)
        .set({
          certificationId: certification.id,
          updatedAt: completedAt,
        })
        .where(eq(products.id, product.id));

      if (input.wasteWeightKg > 0) {
        await tx.insert(wasteRecords).values({
          productionRunId: runId,
          amountKg: input.wasteWeightKg.toFixed(2),
          category: 'recoverable',
          destination: 'Rework queue',
          recordedBy: actorId,
          recordedAt: completedAt,
        });
      }

      const lotIds = lotRows.map((row) => row.lotId);

      if (lotIds.length > 0) {
        await tx
          .update(lots)
          .set({
            status: 'transformed',
            updatedAt: completedAt,
          })
          .where(inArray(lots.id, lotIds));
      }

      await appendWorkflowEvent(tx, {
        aggregateId: runId,
        aggregateType: 'production_run',
        actorId,
        actorType,
        eventType: 'production_completed',
        occurredAt: completedAt,
        payload: {
          outputWeightKg: input.outputWeightKg,
          productCode,
          quantity: input.quantity,
          wasteWeightKg: input.wasteWeightKg,
          yieldPercent,
        },
      });

      return {
        id: product.id,
        certificationId: certification.id,
        productCode: product.productCode,
        status: 'produced',
        createdAt: product.createdAt,
      };
    });
  }
}
