import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { TransformationRepository } from './transformation.repository';
import { EventsService } from '../events/events.service';
import { NotificationsService } from '../notifications/notifications.service';
import { LotsService } from '../lots/lots.service';
import { v4 as uuid } from 'uuid';

const YIELD_DEVIATION_THRESHOLD_PERCENT = 10;

@Injectable()
export class TransformationService {
  private readonly logger = new Logger(TransformationService.name);

  constructor(
    private readonly transformationRepository: TransformationRepository,
    private readonly eventsService: EventsService,
    private readonly notificationsService: NotificationsService,
    private readonly lotsService: LotsService,
  ) {}

  // --- Transformers ---

  async createTransformer(data: {
    name: string;
    track: 'd3_textile' | 'd4_bio';
    regionId: string;
    address: string;
    dailyCapacityKg: string;
    managerId?: string;
  }) {
    const transformer =
      await this.transformationRepository.createTransformer(data);

    await this.eventsService.emit({
      eventType: 'transformer.created',
      aggregateType: 'transformer',
      aggregateId: transformer.id,
      actorId: data.managerId,
      actorType: 'user',
      payload: { name: data.name, track: data.track },
      occurredAt: new Date(),
      version: 1,
    });

    return transformer;
  }

  async getTransformer(id: string) {
    const transformer =
      await this.transformationRepository.findTransformerById(id);
    if (!transformer) {
      throw new NotFoundException(`Transformer ${id} not found`);
    }
    return transformer;
  }

  async listTransformers(track?: 'd3_textile' | 'd4_bio') {
    return this.transformationRepository.findAllTransformers(track);
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
    await this.getTransformer(data.transformerId);
    return this.transformationRepository.createBom(data);
  }

  async listBoms(transformerId: string) {
    return this.transformationRepository.findBomsByTransformer(transformerId);
  }

  // --- Production Runs ---

  async startProductionRun(
    transformerId: string,
    bomId: string,
    lotIds: string[],
    operatedBy: string,
  ) {
    await this.getTransformer(transformerId);

    const bom = await this.transformationRepository.findBomById(bomId);
    if (!bom) {
      throw new NotFoundException(`BOM ${bomId} not found`);
    }

    if (lotIds.length === 0) {
      throw new BadRequestException('At least one lot is required');
    }

    const run = await this.transformationRepository.createProductionRun({
      transformerId,
      bomId,
      bomVersion: bom.version,
      inputWeightKg: '0',
      startedAt: new Date(),
      operatedBy,
    });

    let totalWeight = 0;
    for (const lotId of lotIds) {
      const weightUsed = bom.inputWoolKgPerUnit;
      await this.transformationRepository.addRunLot(
        run.id,
        lotId,
        weightUsed,
      );
      totalWeight += parseFloat(weightUsed);

      // Update lot status and location → in transformation at this transformer
      await this.lotsService.updateLotStatus(lotId, 'in_transformation', operatedBy);
      await this.lotsService.updateLocation(lotId, transformerId, 'transformer');
    }

    const updatedRun =
      await this.transformationRepository.updateProductionRun(run.id, {
        inputWeightKg: totalWeight.toFixed(2),
      });

    await this.eventsService.emit({
      eventType: 'production_run.started',
      aggregateType: 'production_run',
      aggregateId: run.id,
      actorId: operatedBy,
      actorType: 'user',
      payload: {
        transformerId,
        bomId,
        lotIds,
        inputWeightKg: totalWeight.toFixed(2),
      },
      occurredAt: new Date(),
      version: 1,
    });

    return updatedRun;
  }

  async completeProductionRun(
    runId: string,
    outputWeight: number,
    wasteWeight: number,
  ) {
    const run = await this.transformationRepository.findProductionRun(runId);
    if (!run) {
      throw new NotFoundException(`Production run ${runId} not found`);
    }

    if (run.completedAt) {
      throw new BadRequestException('Production run already completed');
    }

    const inputWeight = parseFloat(run.inputWeightKg);
    const yieldPercent =
      inputWeight > 0 ? (outputWeight / inputWeight) * 100 : 0;

    const updatedRun =
      await this.transformationRepository.updateProductionRun(runId, {
        outputWeightKg: outputWeight.toFixed(2),
        wasteWeightKg: wasteWeight.toFixed(2),
        yieldPercent: yieldPercent.toFixed(2),
        completedAt: new Date(),
      });

    // Update all lots in this run to "transformed"
    const runLots = await this.transformationRepository.findRunLots(runId);
    for (const runLot of runLots) {
      await this.lotsService.updateLotStatus(runLot.lotId, 'transformed', run.operatedBy);
    }

    // Check yield against BOM expected yield
    const bom = await this.transformationRepository.findBomById(run.bomId);
    const expectedYield = bom ? parseFloat(bom.expectedYieldPercent) : 0;
    const yieldDeviation = Math.abs(yieldPercent - expectedYield);
    const yieldAnomalous = expectedYield > 0 && yieldDeviation > YIELD_DEVIATION_THRESHOLD_PERCENT;

    const eventPayload: Record<string, unknown> = {
      outputWeightKg: outputWeight,
      wasteWeightKg: wasteWeight,
      yieldPercent: yieldPercent.toFixed(2),
    };

    if (yieldAnomalous) {
      eventPayload.yieldAnomaly = true;
      eventPayload.expectedYieldPercent = expectedYield;
      eventPayload.deviationPercent = yieldDeviation.toFixed(2);

      this.logger.warn(
        `Yield anomaly on run ${runId}: actual ${yieldPercent.toFixed(1)}% vs expected ${expectedYield}% (deviation: ${yieldDeviation.toFixed(1)}%)`,
      );

      // Notify the transformer manager
      const transformer = await this.transformationRepository.findTransformerById(run.transformerId);
      if (transformer?.managerId) {
        await this.notificationsService.send({
          userId: transformer.managerId,
          type: 'a1_alert',
          title: 'Production yield anomaly detected',
          body: `Production run ${runId} at "${transformer.name}" yielded ${yieldPercent.toFixed(1)}% (expected ${expectedYield}%). Deviation of ${yieldDeviation.toFixed(1)}% exceeds ${YIELD_DEVIATION_THRESHOLD_PERCENT}% threshold. Input: ${inputWeight}kg, Output: ${outputWeight}kg, Waste: ${wasteWeight}kg.`,
          payload: {
            productionRunId: runId,
            transformerId: run.transformerId,
            yieldPercent,
            expectedYieldPercent: expectedYield,
            deviationPercent: yieldDeviation,
            inputWeightKg: inputWeight,
            outputWeightKg: outputWeight,
            wasteWeightKg: wasteWeight,
          },
        });
      }
    }

    await this.eventsService.emit({
      eventType: 'production_run.completed',
      aggregateType: 'production_run',
      aggregateId: runId,
      actorId: run.operatedBy,
      actorType: 'user',
      payload: eventPayload,
      occurredAt: new Date(),
      version: 2,
    });

    return updatedRun;
  }

  async getProductionRun(runId: string) {
    const run = await this.transformationRepository.findProductionRun(runId);
    if (!run) {
      throw new NotFoundException(`Production run ${runId} not found`);
    }
    const lots = await this.transformationRepository.findRunLots(runId);
    return { ...run, lots };
  }

  async listProductionRuns(transformerId: string) {
    return this.transformationRepository.findProductionRunsByTransformer(
      transformerId,
    );
  }

  // --- Products ---

  async createProduct(
    runId: string,
    data: {
      productTypeCode: string;
      quantity: string;
      unit: string;
      weightKg: string;
    },
  ) {
    const run = await this.transformationRepository.findProductionRun(runId);
    if (!run) {
      throw new NotFoundException(`Production run ${runId} not found`);
    }

    const transformer =
      await this.transformationRepository.findTransformerById(
        run.transformerId,
      );
    if (!transformer) {
      throw new NotFoundException(
        `Transformer ${run.transformerId} not found`,
      );
    }

    const prefix = transformer.track === 'd3_textile' ? 'P1' : 'P2';
    const shortId = uuid().split('-')[0].toUpperCase();
    const productCode = `${prefix}-${data.productTypeCode}-${shortId}`;

    const product = await this.transformationRepository.createProduct({
      productionRunId: runId,
      productCode,
      productTypeCode: data.productTypeCode,
      track: transformer.track,
      quantity: data.quantity,
      unit: data.unit,
      weightKg: data.weightKg,
      status: 'produced',
    });

    await this.eventsService.emit({
      eventType: 'product.created',
      aggregateType: 'product',
      aggregateId: product.id,
      actorId: run.operatedBy,
      actorType: 'user',
      payload: {
        productCode,
        productionRunId: runId,
        track: transformer.track,
      },
      occurredAt: new Date(),
      version: 1,
    });

    return product;
  }

  async getProduct(id: string) {
    const product =
      await this.transformationRepository.findProductById(id);
    if (!product) {
      throw new NotFoundException(`Product ${id} not found`);
    }
    return product;
  }

  async listProducts(filters?: {
    track?: 'd3_textile' | 'd4_bio';
    status?: string;
    productionRunId?: string;
  }) {
    return this.transformationRepository.findProducts(filters);
  }

  // --- Waste ---

  async recordWaste(data: {
    productionRunId?: string;
    washingRunId?: string;
    amountKg: string;
    category: 'reusable' | 'recoverable' | 'disposal';
    destination?: string;
    recordedBy: string;
  }) {
    const record = await this.transformationRepository.createWasteRecord({
      ...data,
      recordedAt: new Date(),
    });

    await this.eventsService.emit({
      eventType: 'waste.recorded',
      aggregateType: 'waste_record',
      aggregateId: record.id,
      actorId: data.recordedBy,
      actorType: 'user',
      payload: {
        amountKg: data.amountKg,
        category: data.category,
        productionRunId: data.productionRunId,
      },
      occurredAt: new Date(),
      version: 1,
    });

    return record;
  }

  async getWasteByRun(runId: string) {
    return this.transformationRepository.findWasteByRun(runId);
  }
}
