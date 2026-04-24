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
  laverieDispatches,
  laverieReceptions,
  laveries,
  lotWeighs,
  lots,
  pricingProposals,
  qualifications,
  rulesConfig,
  transformers,
  users,
  washingRuns,
} from '../../common/database/schema';
import { appendWorkflowEvent } from '../../common/workflow/workflow-events';
import { CreateLaverieQualificationDto } from './dto/create-laverie-qualification.dto';
import { CreateLaverieReceptionDto } from './dto/create-laverie-reception.dto';
import { CreateWashingRunDto } from './dto/create-washing-run.dto';

@Injectable()
export class LaverieRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async getOverview() {
    const [
      facilities,
      activeRuns,
      recentQualifications,
      washRunCount,
      receptionQueue,
      washQueue,
      qualificationQueue,
      transformerRows,
    ] = await Promise.all([
      this.db
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
        .orderBy(desc(laveries.createdAt)),
      this.db
        .select({
          id: washingRuns.id,
          laverieName: laveries.name,
          dirtyWeightKg: washingRuns.dirtyWeightKg,
          waterLiters: washingRuns.waterLiters,
          waterTempC: washingRuns.waterTempC,
          startedAt: washingRuns.startedAt,
          operatorName: users.fullName,
          // Stage 5/7 fields
          detergentType: washingRuns.detergentType,
          suintRecoveredLiters: washingRuns.suintRecoveredLiters,
        })
        .from(washingRuns)
        .leftJoin(laveries, eq(washingRuns.laverieId, laveries.id))
        .leftJoin(users, eq(washingRuns.operatedBy, users.id))
        .where(isNull(washingRuns.completedAt))
        .orderBy(desc(washingRuns.startedAt))
        .limit(6),
      this.db
        .select({
          id: qualifications.id,
          lotId: qualifications.lotId,
          grade: qualifications.grade,
          safetyStatus: qualifications.safetyStatus,
          fiberLengthMm: qualifications.fiberLengthMm,
          fiberDiameterMicron: qualifications.fiberDiameterMicron,
          moisturePercent: qualifications.moisturePercent,
          color: qualifications.color,
          performedAt: qualifications.performedAt,
          analystName: users.fullName,
          // Stage 7 — Certificat de pureté
          residualHumidityPercent: qualifications.residualHumidityPercent,
          residualSuintPercent: qualifications.residualSuintPercent,
          whitenessIndex: qualifications.whitenessIndex,
          phLevel: qualifications.phLevel,
          energyKwhUsed: qualifications.energyKwhUsed,
          waterLitersPerKg: qualifications.waterLitersPerKg,
        })
        .from(qualifications)
        .leftJoin(users, eq(qualifications.performedBy, users.id))
        .orderBy(desc(qualifications.performedAt))
        .limit(8),
      this.db
        .select({
          count: sql<number>`count(*)::int`,
        })
        .from(washingRuns),
      this.db
        .select({
          id: lots.id,
          qrCode: lots.qrCode,
          sourceType: lots.sourceType,
          urgency: lots.urgency,
          laverieId: lots.currentLocationId,
          laverieName: laveries.name,
          weightKg: lots.actualWeightKg,
        })
        .from(lots)
        .leftJoin(laveries, eq(lots.currentLocationId, laveries.id))
        .where(eq(lots.status, 'dispatched_to_laverie'))
        .orderBy(desc(lots.updatedAt))
        .limit(8),
      this.db
        .select({
          id: lots.id,
          qrCode: lots.qrCode,
          laverieId: lots.currentLocationId,
          laverieName: laveries.name,
          weightKg: lots.actualWeightKg,
          receivedAt: laverieReceptions.receivedAt,
          // Stage 5 fields
          conditioningState: laverieReceptions.conditioningState,
          requiredWashTempC: laverieReceptions.requiredWashTempC,
          requiredDetergentType: laverieReceptions.requiredDetergentType,
        })
        .from(lots)
        .leftJoin(laveries, eq(lots.currentLocationId, laveries.id))
        .leftJoin(laverieReceptions, eq(lots.id, laverieReceptions.lotId))
        .where(eq(lots.status, 'received_laverie'))
        .orderBy(desc(lots.updatedAt))
        .limit(8),
      this.db
        .select({
          id: washingRuns.id,
          lotId: washingRuns.lotId,
          lotQrCode: lots.qrCode,
          laverieId: washingRuns.laverieId,
          laverieName: laveries.name,
          dirtyWeightKg: washingRuns.dirtyWeightKg,
          cleanWeightKg: washingRuns.cleanWeightKg,
          startedAt: washingRuns.startedAt,
          completedAt: washingRuns.completedAt,
        })
        .from(washingRuns)
        .leftJoin(lots, eq(washingRuns.lotId, lots.id))
        .leftJoin(laveries, eq(washingRuns.laverieId, laveries.id))
        .leftJoin(qualifications, eq(washingRuns.id, qualifications.washingRunId))
        .where(isNull(qualifications.id))
        .orderBy(desc(washingRuns.startedAt))
        .limit(8),
      this.db
        .select({
          id: transformers.id,
          name: transformers.name,
          track: transformers.track,
        })
        .from(transformers)
        .orderBy(transformers.name),
    ]);

    return {
      summary: {
        totalLaveries: facilities.length,
        activeLaveries: facilities.filter((facility) => facility.active).length,
        activeRuns: activeRuns.length,
        totalWashRuns: washRunCount[0]?.count ?? 0,
        gradedLots: recentQualifications.length,
      },
      laveries: facilities,
      activeRuns,
      recentQualifications,
      receptionQueue,
      washQueue,
      qualificationQueue,
      transformers: transformerRows,
    };
  }

  async receiveLot(
    input: CreateLaverieReceptionDto,
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

    if (lot.status !== 'dispatched_to_laverie') {
      throw new BadRequestException('Le lot n’est pas en attente de réception laverie.');
    }

    const [laverie] = await this.db
      .select({ id: laveries.id })
      .from(laveries)
      .where(eq(laveries.id, input.laverieId))
      .limit(1);

    if (!laverie) {
      throw new NotFoundException('Laverie introuvable.');
    }

    const receivedAt = new Date();

    return this.db.transaction(async (tx) => {
      const [reception] = await tx
        .insert(laverieReceptions)
        .values({
          laverieId: input.laverieId,
          lotId: input.lotId,
          receivedWeightKg: input.receivedWeightKg.toFixed(2),
          receivedBy: actorId,
          receivedAt,
          // Stage 5 fields
          conditioningState: input.conditioningState,
          requiredWashTempC: input.requiredWashTempC?.toFixed(2),
          requiredDetergentType: input.requiredDetergentType,
        })
        .returning({
          id: laverieReceptions.id,
          receivedAt: laverieReceptions.receivedAt,
        });

      await tx
        .update(lots)
        .set({
          actualWeightKg: input.receivedWeightKg.toFixed(2),
          currentLocationId: input.laverieId,
          currentLocationType: 'laverie',
          status: 'received_laverie',
          updatedAt: receivedAt,
        })
        .where(eq(lots.id, input.lotId));

      await tx.insert(lotWeighs).values({
        lotId: input.lotId,
        phase: 'laverie_entry',
        weightKg: input.receivedWeightKg.toFixed(2),
        source: 'manual',
        recordedBy: actorId,
        recordedAt: receivedAt,
      });

      await appendWorkflowEvent(tx, {
        aggregateId: input.lotId,
        aggregateType: 'lot',
        actorId,
        actorType,
        eventType: 'laverie_received',
        occurredAt: receivedAt,
        payload: {
          laverieId: input.laverieId,
          lotQrCode: lot.qrCode,
          receivedWeightKg: input.receivedWeightKg,
        },
      });

      return {
        id: reception.id,
        lotId: input.lotId,
        status: 'received_laverie',
        receivedAt: reception.receivedAt,
      };
    });
  }

  async startWash(
    input: CreateWashingRunDto,
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

    if (lot.status !== 'received_laverie') {
      throw new BadRequestException('Le lot doit être reçu avant démarrage du lavage.');
    }

    const [existingRun] = await this.db
      .select({ id: washingRuns.id })
      .from(washingRuns)
      .where(and(eq(washingRuns.lotId, input.lotId), isNull(washingRuns.completedAt)))
      .limit(1);

    if (existingRun) {
      throw new BadRequestException('Un run de lavage actif existe déjà pour ce lot.');
    }

    const startedAt = new Date();

    return this.db.transaction(async (tx) => {
      const [run] = await tx
        .insert(washingRuns)
        .values({
          laverieId: input.laverieId,
          lotId: input.lotId,
          dirtyWeightKg: input.dirtyWeightKg.toFixed(2),
          waterLiters:
            input.waterLiters === undefined ? null : input.waterLiters.toFixed(2),
          waterTempC:
            input.waterTempC === undefined ? null : input.waterTempC.toFixed(2),
          cycleDurationMinutes: input.cycleDurationMinutes ?? null,
          detergentType: input.detergentType,
          suintRecoveredLiters: input.suintRecoveredLiters?.toFixed(2),
          startedAt,
          operatedBy: actorId,
        })
        .returning({
          id: washingRuns.id,
          startedAt: washingRuns.startedAt,
        });

      await tx
        .update(lots)
        .set({
          actualWeightKg: input.dirtyWeightKg.toFixed(2),
          currentLocationId: input.laverieId,
          currentLocationType: 'laverie',
          status: 'washing',
          updatedAt: startedAt,
        })
        .where(eq(lots.id, input.lotId));

      await tx.insert(lotWeighs).values({
        lotId: input.lotId,
        phase: 'washing_in',
        weightKg: input.dirtyWeightKg.toFixed(2),
        source: 'manual',
        recordedBy: actorId,
        recordedAt: startedAt,
      });

      await appendWorkflowEvent(tx, {
        aggregateId: run.id,
        aggregateType: 'washing_run',
        actorId,
        actorType,
        eventType: 'washing_started',
        occurredAt: startedAt,
        payload: {
          dirtyWeightKg: input.dirtyWeightKg,
          laverieId: input.laverieId,
          lotId: input.lotId,
          lotQrCode: lot.qrCode,
        },
      });

      return {
        id: run.id,
        lotId: input.lotId,
        status: 'washing',
        startedAt: run.startedAt,
      };
    });
  }

  async qualifyLot(
    input: CreateLaverieQualificationDto,
    actorId: string,
    actorType: string,
  ) {
    const [run] = await this.db
      .select({
        id: washingRuns.id,
        lotId: washingRuns.lotId,
        laverieId: washingRuns.laverieId,
        dirtyWeightKg: washingRuns.dirtyWeightKg,
        cleanWeightKg: washingRuns.cleanWeightKg,
        completedAt: washingRuns.completedAt,
        lotQrCode: lots.qrCode,
        lotUrgency: lots.urgency,
        lotSourceType: lots.sourceType,
      })
      .from(washingRuns)
      .leftJoin(lots, eq(washingRuns.lotId, lots.id))
      .where(eq(washingRuns.id, input.washingRunId))
      .limit(1);

    if (!run) {
      throw new NotFoundException('Run de lavage introuvable.');
    }

    const [existingQualification] = await this.db
      .select({ id: qualifications.id })
      .from(qualifications)
      .where(eq(qualifications.washingRunId, input.washingRunId))
      .limit(1);

    if (existingQualification) {
      throw new BadRequestException('Ce run a déjà été qualifié.');
    }

    if (
      ['d3_textile', 'd4_bio'].includes(input.dispatchTrack) &&
      !input.targetTransformerId
    ) {
      throw new BadRequestException('Le transformateur cible est requis pour un dispatch D3 ou D4.');
    }

    const [pricingRule] = await this.db
      .select({
        version: rulesConfig.version,
        value: rulesConfig.value,
      })
      .from(rulesConfig)
      .where(eq(rulesConfig.ruleKey, 'pricing.base.matrix'))
      .orderBy(desc(rulesConfig.effectiveFrom))
      .limit(1);

    const [dispatchRule] = await this.db
      .select({
        version: rulesConfig.version,
      })
      .from(rulesConfig)
      .where(eq(rulesConfig.ruleKey, 'dispatch.s2s3.routing'))
      .orderBy(desc(rulesConfig.effectiveFrom))
      .limit(1);

    const pricingMatrix =
      pricingRule && typeof pricingRule.value === 'object' && pricingRule.value
        ? (pricingRule.value as Record<string, number>)
        : { A: 1200, B: 850, C: 500, reject: 0 };
    const basePricePerKg = Number(pricingMatrix[input.grade] ?? 0);
    const urgencyDiscountPercent = run.lotUrgency === 'urgent' ? 8 : 0;
    const sourceTypeAdjustmentPercent =
      run.lotSourceType === 'c1_shepherd'
        ? 5
        : run.lotSourceType === 'c3_aggregator'
          ? -5
          : 0;
    const finalPricePerKg =
      basePricePerKg *
      (1 - urgencyDiscountPercent / 100) *
      (1 + sourceTypeAdjustmentPercent / 100);
    const totalValue = finalPricePerKg * input.cleanWeightKg;
    const completedAt = new Date();
    const yieldPercent =
      Number(run.dirtyWeightKg ?? 0) > 0
        ? (input.cleanWeightKg / Number(run.dirtyWeightKg)) * 100
        : 0;

    return this.db.transaction(async (tx) => {
      await tx
        .update(washingRuns)
        .set({
          cleanWeightKg: input.cleanWeightKg.toFixed(2),
          yieldPercent: yieldPercent.toFixed(2),
          completedAt,
        })
        .where(eq(washingRuns.id, input.washingRunId));

      const [qualification] = await tx
        .insert(qualifications)
        .values({
          lotId: run.lotId,
          washingRunId: input.washingRunId,
          fiberLengthMm:
            input.fiberLengthMm === undefined ? null : input.fiberLengthMm.toFixed(2),
          fiberDiameterMicron:
            input.fiberDiameterMicron === undefined
              ? null
              : input.fiberDiameterMicron.toFixed(2),
          moisturePercent:
            input.moisturePercent === undefined
              ? null
              : input.moisturePercent.toFixed(2),
          cleanlinessScore: input.cleanlinessScore ?? null,
          color: input.color ?? null,
          grade: input.grade,
          safetyStatus: input.safetyStatus,
          contaminationNotes: input.contaminationNotes ?? null,
          // Stage 7 — Sortie laverie / Certificat de pureté
          residualHumidityPercent: input.residualHumidityPercent?.toFixed(2),
          residualSuintPercent: input.residualSuintPercent?.toFixed(2),
          whitenessIndex: input.whitenessIndex?.toFixed(2),
          phLevel: input.phLevel?.toFixed(2),
          energyKwhUsed: input.energyKwhUsed?.toFixed(2),
          waterLitersPerKg: input.waterLitersPerKg?.toFixed(3),
          performedBy: actorId,
          performedAt: completedAt,
        })
        .returning({
          id: qualifications.id,
          performedAt: qualifications.performedAt,
        });

      await tx.insert(pricingProposals).values({
        lotId: run.lotId,
        qualificationId: qualification.id,
        basePricePerKg: basePricePerKg.toFixed(2),
        urgencyDiscountPercent: urgencyDiscountPercent.toFixed(2),
        sourceTypeAdjustmentPercent: sourceTypeAdjustmentPercent.toFixed(2),
        finalPricePerKg: finalPricePerKg.toFixed(2),
        totalValue: totalValue.toFixed(2),
        computedAt: completedAt,
      });

      if (input.dispatchTrack === 'd3_textile' || input.dispatchTrack === 'd4_bio') {
        await tx.insert(laverieDispatches).values({
          lotId: run.lotId,
          qualificationId: qualification.id,
          track: input.dispatchTrack,
          targetTransformerId: input.targetTransformerId ?? null,
          ruleVersion: dispatchRule?.version ?? 1,
          dispatchedBy: actorId,
          dispatchedAt: completedAt,
        });
      }

      await tx
        .update(lots)
        .set({
          actualWeightKg: input.cleanWeightKg.toFixed(2),
          currentLocationId: input.targetTransformerId ?? run.laverieId,
          currentLocationType:
            input.dispatchTrack === 'quarantine' || input.dispatchTrack === 'reject'
              ? 'laverie'
              : 'transformer',
          status:
            input.dispatchTrack === 'd3_textile'
              ? 'dispatched_to_d3'
              : input.dispatchTrack === 'd4_bio'
                ? 'dispatched_to_d4'
                : input.dispatchTrack === 'quarantine'
                  ? 'quarantined'
                  : 'rejected',
          updatedAt: completedAt,
        })
        .where(eq(lots.id, run.lotId));

      await tx.insert(lotWeighs).values({
        lotId: run.lotId,
        phase: 'washing_out',
        weightKg: input.cleanWeightKg.toFixed(2),
        source: 'manual',
        recordedBy: actorId,
        recordedAt: completedAt,
      });

      await appendWorkflowEvent(tx, {
        aggregateId: qualification.id,
        aggregateType: 'qualification',
        actorId,
        actorType,
        eventType: 'qualification_recorded',
        occurredAt: completedAt,
        payload: {
          cleanWeightKg: input.cleanWeightKg,
          dispatchTrack: input.dispatchTrack,
          grade: input.grade,
          lotId: run.lotId,
          lotQrCode: run.lotQrCode,
          safetyStatus: input.safetyStatus,
          targetTransformerId: input.targetTransformerId ?? null,
          washingRunId: input.washingRunId,
          yieldPercent,
        },
      });

      return {
        id: qualification.id,
        lotId: run.lotId,
        status:
          input.dispatchTrack === 'd3_textile'
            ? 'dispatched_to_d3'
            : input.dispatchTrack === 'd4_bio'
              ? 'dispatched_to_d4'
              : input.dispatchTrack === 'quarantine'
                ? 'quarantined'
                : 'rejected',
        performedAt: qualification.performedAt,
      };
    });
  }
}
