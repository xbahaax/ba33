import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { DepotRepository } from './depot.repository';
import { EventsService } from '../events/events.service';
import { RulesService } from '../rules/rules.service';
import { v4 as uuid } from 'uuid';

@Injectable()
export class DepotService {
  private readonly logger = new Logger(DepotService.name);

  constructor(
    private readonly depotRepository: DepotRepository,
    private readonly eventsService: EventsService,
    private readonly rulesService: RulesService,
  ) {}

  async createDepot(data: {
    name: string;
    regionId: string;
    address: string;
    capacityKg: string;
    managerId?: string;
  }) {
    const id = uuid();
    return this.depotRepository.createDepot({
      id,
      ...data,
      currentWeightKg: '0',
    });
  }

  async getDepot(id: string) {
    const depot = await this.depotRepository.findDepotById(id);
    if (!depot) {
      throw new NotFoundException(`Depot "${id}" not found`);
    }
    const zones = await this.depotRepository.findZones(id);
    return { ...depot, zones };
  }

  async listDepots() {
    return this.depotRepository.findAllDepots();
  }

  async createZone(
    depotId: string,
    data: {
      code: string;
      purpose: 'c1_normal' | 'c2_urgent' | 'c3_aggregator' | 'quarantine' | 'dispatch_ready';
      capacityKg: string;
    },
  ) {
    const depot = await this.depotRepository.findDepotById(depotId);
    if (!depot) {
      throw new NotFoundException(`Depot "${depotId}" not found`);
    }
    const id = uuid();
    return this.depotRepository.createZone({
      id,
      depotId,
      ...data,
      currentWeightKg: '0',
    });
  }

  async receiveLot(
    depotId: string,
    lotId: string,
    declaredWeight: number,
    actualWeight: number,
    zoneId: string,
    receivedBy: string,
  ) {
    const depot = await this.depotRepository.findDepotById(depotId);
    if (!depot) {
      throw new NotFoundException(`Depot "${depotId}" not found`);
    }

    const tolerancePercent = await this.rulesService.getRuleValue<number>(
      'reconciliation.tolerance_percent',
    );
    const discrepancy = Math.abs(actualWeight - declaredWeight);
    const toleranceThreshold = (tolerancePercent / 100) * declaredWeight;
    const toleranceExceeded = discrepancy > toleranceThreshold;

    const reception = await this.depotRepository.createReception({
      id: uuid(),
      depotId,
      lotId,
      declaredWeightKg: declaredWeight.toString(),
      actualWeightKg: actualWeight.toString(),
      discrepancyKg: discrepancy.toString(),
      toleranceExceeded,
      zoneId,
      receivedBy,
      receivedAt: new Date(),
    });

    // Update depot current weight
    const newWeight = parseFloat(depot.currentWeightKg) + actualWeight;
    await this.depotRepository.updateDepot(depotId, {
      currentWeightKg: newWeight.toString(),
    });

    // Emit E1 event
    await this.eventsService.emit({
      eventType: 'depot.lot.received',
      aggregateType: 'lot',
      aggregateId: lotId,
      actorId: receivedBy,
      actorType: 'depot_manager',
      payload: {
        depotId,
        lotId,
        declaredWeightKg: declaredWeight,
        actualWeightKg: actualWeight,
        discrepancyKg: discrepancy,
        toleranceExceeded,
        zoneId,
      },
      occurredAt: new Date(),
      version: 1,
    });

    // Check A1 conditions after reception
    await this.checkA1Conditions(depotId);

    return reception;
  }

  async createDispatch(
    depotId: string,
    laverieId: string,
    lotIds: Array<{ lotId: string; weightKg: number }>,
    dispatchedBy: string,
  ) {
    const depot = await this.depotRepository.findDepotById(depotId);
    if (!depot) {
      throw new NotFoundException(`Depot "${depotId}" not found`);
    }

    const manifestWeight = lotIds.reduce((sum, l) => sum + l.weightKg, 0);
    const dispatchId = uuid();

    const dispatch = await this.depotRepository.createDispatch({
      id: dispatchId,
      depotId,
      destinationLaverieId: laverieId,
      manifestWeightKg: manifestWeight.toString(),
      dispatchedBy,
      dispatchedAt: new Date(),
    });

    for (const lot of lotIds) {
      await this.depotRepository.addDispatchLot(
        dispatchId,
        lot.lotId,
        lot.weightKg.toString(),
      );
    }

    // Update depot current weight
    const newWeight = parseFloat(depot.currentWeightKg) - manifestWeight;
    await this.depotRepository.updateDepot(depotId, {
      currentWeightKg: Math.max(0, newWeight).toString(),
    });

    // Emit S1 event
    await this.eventsService.emit({
      eventType: 'depot.lot.dispatched',
      aggregateType: 'dispatch',
      aggregateId: dispatchId,
      actorId: dispatchedBy,
      actorType: 'depot_manager',
      payload: {
        depotId,
        destinationLaverieId: laverieId,
        manifestWeightKg: manifestWeight,
        lots: lotIds,
      },
      occurredAt: new Date(),
      version: 1,
    });

    return dispatch;
  }

  async checkA1Conditions(depotId: string) {
    const depot = await this.depotRepository.findDepotById(depotId);
    if (!depot) return;

    const weightThresholdPercent = await this.rulesService.getRuleValue<number>(
      'a1.depot_weight_threshold_percent',
    );

    const currentWeight = parseFloat(depot.currentWeightKg);
    const capacity = parseFloat(depot.capacityKg);
    const usagePercent = capacity > 0 ? (currentWeight / capacity) * 100 : 0;

    if (usagePercent >= weightThresholdPercent) {
      const existingAlerts = await this.depotRepository.findActiveAlerts(depotId);
      const hasCapacityAlert = existingAlerts.some(
        (a) =>
          a.triggerCondition &&
          typeof a.triggerCondition === 'object' &&
          (a.triggerCondition as Record<string, unknown>).type === 'capacity_threshold',
      );

      if (!hasCapacityAlert) {
        await this.depotRepository.createA1Alert({
          id: uuid(),
          depotId,
          triggerCondition: {
            type: 'capacity_threshold',
            usagePercent,
            thresholdPercent: weightThresholdPercent,
            currentWeightKg: currentWeight,
            capacityKg: capacity,
          },
          severity: usagePercent >= 95 ? 'critical' : 'warning',
          status: 'open',
          firedAt: new Date(),
        });

        this.logger.warn(
          `A1 alert fired for depot ${depotId}: capacity at ${usagePercent.toFixed(1)}%`,
        );
      }
    }
  }

  async acknowledgeAlert(alertId: string) {
    return this.depotRepository.updateAlert(alertId, { status: 'acknowledged' });
  }

  async getActiveAlerts(depotId?: string) {
    return this.depotRepository.findActiveAlerts(depotId);
  }

  async resolveAlert(alertId: string) {
    return this.depotRepository.updateAlert(alertId, {
      status: 'resolved',
      resolvedAt: new Date(),
    });
  }
}
