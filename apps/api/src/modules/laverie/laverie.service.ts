import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { LaverieRepository } from './laverie.repository';
import { EventsService } from '../events/events.service';
import { RulesService } from '../rules/rules.service';
import { NotificationsService } from '../notifications/notifications.service';
import { LotsService } from '../lots/lots.service';
import { AuditService } from '../audit/audit.service';
import { v4 as uuid } from 'uuid';

@Injectable()
export class LaverieService {
  private readonly logger = new Logger(LaverieService.name);

  constructor(
    private readonly laverieRepository: LaverieRepository,
    private readonly eventsService: EventsService,
    private readonly rulesService: RulesService,
    private readonly notificationsService: NotificationsService,
    private readonly lotsService: LotsService,
    private readonly auditService: AuditService,
  ) {}

  // ── Laveries ────────────────────────────────────────────

  async createLaverie(data: {
    name: string;
    regionId: string;
    address: string;
    dailyCapacityKg: string;
    managerId?: string;
  }) {
    return this.laverieRepository.createLaverie({
      id: uuid(),
      ...data,
    });
  }

  async getLaverie(id: string) {
    const laverie = await this.laverieRepository.findLaverieById(id);
    if (!laverie) {
      throw new NotFoundException(`Laverie "${id}" not found`);
    }
    return laverie;
  }

  async listLaveries() {
    return this.laverieRepository.findAllLaveries();
  }

  // ── Reception ───────────────────────────────────────────

  async receiveLot(
    laverieId: string,
    lotId: string,
    receivedWeightKg: number,
    receivedBy: string,
    depotDispatchId?: string,
  ) {
    const laverie = await this.getLaverie(laverieId);

    const reception = await this.laverieRepository.createReception({
      id: uuid(),
      laverieId,
      lotId,
      depotDispatchId,
      receivedWeightKg: receivedWeightKg.toString(),
      receivedBy,
      receivedAt: new Date(),
    });

    // Update lot status and location
    await this.lotsService.updateLotStatus(lotId, 'received_laverie', receivedBy);
    await this.lotsService.updateLocation(lotId, laverieId, 'laverie');

    // Reconcile weight: depot dispatch → laverie reception
    try {
      const tolerancePercent = await this.rulesService.getRuleValue<number>(
        'reconciliation.tolerance_percent',
      );
      // Use the lot's declared weight as the "out" weight from previous phase
      const lot = await this.lotsService.getLot(lotId);
      const lastWeigh = lot.weighs?.[0];
      if (lastWeigh) {
        await this.auditService.reconcileWeight({
          lotId,
          phaseFrom: 'depot',
          phaseTo: 'laverie',
          weightOutKg: parseFloat(lastWeigh.weightKg),
          weightInKg: receivedWeightKg,
          tolerancePercent,
        });
      }
    } catch {
      // reconciliation rule not seeded — skip
    }

    await this.eventsService.emit({
      eventType: 'laverie.lot.received',
      aggregateType: 'lot',
      aggregateId: lotId,
      actorId: receivedBy,
      actorType: 'laverie_operator',
      payload: { laverieId, receivedWeightKg, depotDispatchId },
      occurredAt: new Date(),
      version: 1,
    });

    return reception;
  }

  // ── Pre-Wash Safety Check (for C2 lots) ─────────────────

  async preWashCheck(
    lotId: string,
    data: {
      vetCertReference?: string;
      visualInspectionPassed: boolean;
      contaminationDetected: boolean;
      action: 'approved' | 'quarantined' | 'rejected';
    },
    performedBy: string,
  ) {
    const check = await this.laverieRepository.createPreWashCheck({
      id: uuid(),
      lotId,
      vetCertReference: data.vetCertReference,
      visualInspectionPassed: data.visualInspectionPassed,
      contaminationDetected: data.contaminationDetected,
      action: data.action,
      performedBy,
      performedAt: new Date(),
    });

    if (data.action === 'quarantined') {
      await this.lotsService.updateLotStatus(lotId, 'quarantined', performedBy);
    } else if (data.action === 'rejected') {
      await this.lotsService.updateLotStatus(lotId, 'rejected', performedBy);
    }

    await this.eventsService.emit({
      eventType: 'laverie.prewash.completed',
      aggregateType: 'lot',
      aggregateId: lotId,
      actorId: performedBy,
      actorType: 'laverie_operator',
      payload: { action: data.action, contaminationDetected: data.contaminationDetected },
      occurredAt: new Date(),
      version: 1,
    });

    return check;
  }

  // ── Washing ─────────────────────────────────────────────

  async startWash(
    laverieId: string,
    lotId: string,
    dirtyWeightKg: number,
    operatedBy: string,
  ) {
    await this.getLaverie(laverieId);

    const run = await this.laverieRepository.createWashingRun({
      id: uuid(),
      laverieId,
      lotId,
      dirtyWeightKg: dirtyWeightKg.toString(),
      operatedBy,
      startedAt: new Date(),
    });

    // Update lot status
    await this.lotsService.updateLotStatus(lotId, 'washing', operatedBy);

    // Record dirty weigh
    await this.lotsService.getLot(lotId); // ensure lot exists
    // We can't directly call lotsRepository, so we emit event with weight info

    await this.eventsService.emit({
      eventType: 'laverie.wash.started',
      aggregateType: 'lot',
      aggregateId: lotId,
      actorId: operatedBy,
      actorType: 'laverie_operator',
      payload: { washingRunId: run.id, laverieId, dirtyWeightKg },
      occurredAt: new Date(),
      version: 1,
    });

    return run;
  }

  async completeWash(
    washingRunId: string,
    cleanWeightKg: number,
    processData?: {
      waterLiters?: number;
      chemicals?: unknown;
      cycleDurationMinutes?: number;
      waterTempC?: number;
    },
  ) {
    const run = await this.laverieRepository.findWashingRunById(washingRunId);
    if (!run) {
      throw new NotFoundException(`Washing run "${washingRunId}" not found`);
    }
    if (run.completedAt) {
      throw new BadRequestException('Washing run already completed');
    }

    // R1 Yield calculation (Point Vert)
    const dirtyWeight = parseFloat(run.dirtyWeightKg);
    const yieldPercent = dirtyWeight > 0 ? (cleanWeightKg / dirtyWeight) * 100 : 0;

    const updatedRun = await this.laverieRepository.updateWashingRun(washingRunId, {
      cleanWeightKg: cleanWeightKg.toString(),
      yieldPercent: yieldPercent.toFixed(2),
      waterLiters: processData?.waterLiters?.toString(),
      chemicals: processData?.chemicals,
      cycleDurationMinutes: processData?.cycleDurationMinutes,
      waterTempC: processData?.waterTempC?.toString(),
      completedAt: new Date(),
    });

    // Update lot status
    await this.lotsService.updateLotStatus(run.lotId, 'washed', run.operatedBy);

    await this.eventsService.emit({
      eventType: 'laverie.wash.completed',
      aggregateType: 'lot',
      aggregateId: run.lotId,
      actorId: run.operatedBy,
      actorType: 'laverie_operator',
      payload: {
        washingRunId,
        dirtyWeightKg: dirtyWeight,
        cleanWeightKg,
        yieldPercent: yieldPercent.toFixed(2),
      },
      occurredAt: new Date(),
      version: 1,
    });

    this.logger.log(
      `Wash completed: run ${washingRunId}, lot ${run.lotId}, yield ${yieldPercent.toFixed(1)}%`,
    );

    return updatedRun;
  }

  // ── Qualification (Grading) ─────────────────────────────

  async qualifyLot(
    washingRunId: string,
    data: {
      fiberLengthMm?: number;
      fiberDiameterMicron?: number;
      moisturePercent?: number;
      cleanlinessScore?: number;
      color?: string;
      grade: 'A' | 'B' | 'C' | 'reject';
      safetyStatus: 'clear' | 'flagged' | 'rejected';
      contaminationNotes?: string;
    },
    performedBy: string,
  ) {
    const run = await this.laverieRepository.findWashingRunById(washingRunId);
    if (!run) {
      throw new NotFoundException(`Washing run "${washingRunId}" not found`);
    }
    if (!run.completedAt) {
      throw new BadRequestException('Cannot qualify a lot before washing is complete');
    }

    const qualification = await this.laverieRepository.createQualification({
      id: uuid(),
      lotId: run.lotId,
      washingRunId,
      fiberLengthMm: data.fiberLengthMm?.toString(),
      fiberDiameterMicron: data.fiberDiameterMicron?.toString(),
      moisturePercent: data.moisturePercent?.toString(),
      cleanlinessScore: data.cleanlinessScore,
      color: data.color,
      grade: data.grade,
      safetyStatus: data.safetyStatus,
      contaminationNotes: data.contaminationNotes,
      performedBy,
      performedAt: new Date(),
    });

    // Update lot status
    if (data.safetyStatus === 'rejected') {
      await this.lotsService.updateLotStatus(run.lotId, 'rejected', performedBy);
    } else if (data.grade === 'reject') {
      await this.lotsService.updateLotStatus(run.lotId, 'rejected', performedBy);
    } else {
      await this.lotsService.updateLotStatus(run.lotId, 'qualified', performedBy);
    }

    // Compute pricing proposal
    const pricing = await this.computePricing(
      run.lotId,
      qualification.id,
      data.grade,
      parseFloat(run.cleanWeightKg ?? '0'),
    );

    await this.eventsService.emit({
      eventType: 'laverie.lot.qualified',
      aggregateType: 'lot',
      aggregateId: run.lotId,
      actorId: performedBy,
      actorType: 'laverie_operator',
      payload: {
        qualificationId: qualification.id,
        grade: data.grade,
        safetyStatus: data.safetyStatus,
        fiberLengthMm: data.fiberLengthMm,
        finalPricePerKg: pricing.finalPricePerKg,
      },
      occurredAt: new Date(),
      version: 1,
    });

    return { qualification, pricing };
  }

  // ── Pricing Engine ──────────────────────────────────────

  private async computePricing(
    lotId: string,
    qualificationId: string,
    grade: 'A' | 'B' | 'C' | 'reject',
    cleanWeightKg: number,
  ) {
    // Base price per grade (DZD/kg) — could be a rule, hardcoded for now
    const BASE_PRICES: Record<string, number> = {
      A: 1200,
      B: 800,
      C: 400,
      reject: 0,
    };

    const basePricePerKg = BASE_PRICES[grade] ?? 0;

    // Get lot to check urgency and source type
    const lot = await this.lotsService.getLot(lotId);

    let urgencyDiscountPercent = 0;
    let sourceTypeAdjustmentPercent = 0;

    try {
      if (lot.isUrgent || lot.urgency === 'urgent') {
        urgencyDiscountPercent = await this.rulesService.getRuleValue<number>(
          'pricing.urgency_discount_percent',
        );
      }
      if (lot.sourceType === 'c2_slaughterhouse') {
        sourceTypeAdjustmentPercent = await this.rulesService.getRuleValue<number>(
          'pricing.c2_safety_premium_percent',
        );
      }
    } catch {
      // Rules not seeded — use defaults
    }

    const adjustedPrice =
      basePricePerKg *
      (1 - urgencyDiscountPercent / 100) *
      (1 + sourceTypeAdjustmentPercent / 100);

    const finalPricePerKg = Math.max(0, adjustedPrice);
    const totalValue = finalPricePerKg * cleanWeightKg;

    return this.laverieRepository.createPricingProposal({
      id: uuid(),
      lotId,
      qualificationId,
      basePricePerKg: basePricePerKg.toFixed(2),
      urgencyDiscountPercent: urgencyDiscountPercent.toFixed(2),
      sourceTypeAdjustmentPercent: sourceTypeAdjustmentPercent.toFixed(2),
      finalPricePerKg: finalPricePerKg.toFixed(2),
      totalValue: totalValue.toFixed(2),
      computedAt: new Date(),
    });
  }

  // ── S2/S3 Dispatch Routing ──────────────────────────────

  async dispatchLot(
    qualificationId: string,
    targetTransformerId?: string,
    dispatchedBy?: string,
  ) {
    const qualification = await this.laverieRepository.findQualificationById(qualificationId);
    if (!qualification) {
      throw new NotFoundException(`Qualification "${qualificationId}" not found`);
    }

    // S2/S3 routing logic — determine track based on grade + fiber length
    const track = await this.determineDispatchTrack(qualification);

    const dispatch = await this.laverieRepository.createDispatch({
      id: uuid(),
      lotId: qualification.lotId,
      qualificationId,
      track,
      targetTransformerId,
      ruleVersion: 1,
      dispatchedBy,
      dispatchedAt: new Date(),
    });

    // Update lot status based on track
    const statusMap: Record<string, string> = {
      d3_textile: 'dispatched_to_d3',
      d4_bio: 'dispatched_to_d4',
      quarantine: 'quarantined',
      reject: 'rejected',
    };
    const newStatus = statusMap[track] ?? 'dispatched_to_d3';
    await this.lotsService.updateLotStatus(
      qualification.lotId,
      newStatus,
      dispatchedBy ?? 'system',
    );

    await this.eventsService.emit({
      eventType: 'laverie.lot.dispatched',
      aggregateType: 'lot',
      aggregateId: qualification.lotId,
      actorId: dispatchedBy,
      actorType: 'laverie_operator',
      payload: {
        qualificationId,
        track,
        targetTransformerId,
        grade: qualification.grade,
      },
      occurredAt: new Date(),
      version: 1,
    });

    this.logger.log(
      `Lot ${qualification.lotId} dispatched to ${track}${targetTransformerId ? ` (transformer ${targetTransformerId})` : ''}`,
    );

    return dispatch;
  }

  private async determineDispatchTrack(
    qualification: {
      grade: string;
      fiberLengthMm: string | null;
      safetyStatus: string;
    },
  ): Promise<'d3_textile' | 'd4_bio' | 'quarantine' | 'reject'> {
    // Rejected safety or grade → reject
    if (qualification.safetyStatus === 'rejected' || qualification.grade === 'reject') {
      return 'reject';
    }

    // Flagged safety → quarantine
    if (qualification.safetyStatus === 'flagged') {
      return 'quarantine';
    }

    // Load rules for D3 dispatch criteria
    let minGrade = 'B';
    let minFiberLength = 50;
    try {
      minGrade = await this.rulesService.getRuleValue<string>('s2s3.d3_min_grade');
      minFiberLength = await this.rulesService.getRuleValue<number>('s2s3.d3_min_fiber_length_mm');
    } catch {
      // Use defaults
    }

    const gradeOrder = ['A', 'B', 'C'];
    const gradeIndex = gradeOrder.indexOf(qualification.grade);
    const minGradeIndex = gradeOrder.indexOf(minGrade);
    const gradeOk = gradeIndex >= 0 && gradeIndex <= minGradeIndex;

    const fiberLength = qualification.fiberLengthMm
      ? parseFloat(qualification.fiberLengthMm)
      : 0;
    const fiberOk = fiberLength >= minFiberLength;

    // Grade A/B with good fiber → D3 textile
    if (gradeOk && fiberOk) {
      return 'd3_textile';
    }

    // Everything else → D4 bio
    return 'd4_bio';
  }

  // ── Queries ─────────────────────────────────────────────

  async getWashingRuns(laverieId?: string, lotId?: string) {
    return this.laverieRepository.findWashingRuns(laverieId, lotId);
  }

  async getQualifications(lotId?: string) {
    return this.laverieRepository.findQualifications(lotId);
  }
}
