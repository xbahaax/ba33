import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { DepotRepository } from './depot.repository';
import { EventsService } from '../events/events.service';
import { RulesService } from '../rules/rules.service';
import { NotificationsService } from '../notifications/notifications.service';
import { v4 as uuid } from 'uuid';

@Injectable()
export class DepotService {
  private readonly logger = new Logger(DepotService.name);

  constructor(
    private readonly depotRepository: DepotRepository,
    private readonly eventsService: EventsService,
    private readonly rulesService: RulesService,
    private readonly notificationsService: NotificationsService,
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

    // Notify if tolerance exceeded
    if (toleranceExceeded && depot.managerId) {
      await this.notificationsService.send({
        userId: depot.managerId,
        type: 'tolerance_exceeded',
        title: 'Weight tolerance exceeded on lot reception',
        body: `Lot ${lotId} arrived at depot "${depot.name}" with a ${discrepancy.toFixed(2)}kg discrepancy (declared: ${declaredWeight}kg, actual: ${actualWeight}kg). Tolerance threshold: ${tolerancePercent}%.`,
        payload: {
          depotId,
          lotId,
          declaredWeightKg: declaredWeight,
          actualWeightKg: actualWeight,
          discrepancyKg: discrepancy,
          tolerancePercent,
        },
      });
    }

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
        const severity = usagePercent >= 95 ? 'critical' : 'warning';

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
          severity,
          status: 'open',
          firedAt: new Date(),
        });

        this.logger.warn(
          `A1 alert fired for depot ${depotId}: capacity at ${usagePercent.toFixed(1)}%`,
        );

        // Notify depot manager if one is assigned
        if (depot.managerId) {
          await this.notificationsService.send({
            userId: depot.managerId,
            type: 'a1_alert',
            title: `A1 Alert: Depot capacity ${severity}`,
            body: `Depot "${depot.name}" is at ${usagePercent.toFixed(1)}% capacity (${currentWeight.toFixed(1)}kg / ${capacity.toFixed(1)}kg). Immediate action required.`,
            payload: {
              depotId,
              severity,
              usagePercent,
              currentWeightKg: currentWeight,
              capacityKg: capacity,
            },
          });
        }
      }
    }

    // Check urgent lot count threshold
    try {
      const urgentCountThreshold = await this.rulesService.getRuleValue<number>(
        'a1.depot_urgent_count_threshold',
      );
      const urgentLotCount = await this.depotRepository.countUrgentLots(depotId);

      if (urgentLotCount >= urgentCountThreshold) {
        const existingAlerts = await this.depotRepository.findActiveAlerts(depotId);
        const hasUrgentCountAlert = existingAlerts.some(
          (a) =>
            a.triggerCondition &&
            typeof a.triggerCondition === 'object' &&
            (a.triggerCondition as Record<string, unknown>).type === 'urgent_lot_count',
        );

        if (!hasUrgentCountAlert) {
          await this.depotRepository.createA1Alert({
            id: uuid(),
            depotId,
            triggerCondition: {
              type: 'urgent_lot_count',
              urgentLotCount,
              thresholdCount: urgentCountThreshold,
            },
            severity: 'critical',
            status: 'open',
            firedAt: new Date(),
          });

          this.logger.warn(
            `A1 alert fired for depot ${depotId}: ${urgentLotCount} urgent lots (threshold: ${urgentCountThreshold})`,
          );

          if (depot.managerId) {
            await this.notificationsService.send({
              userId: depot.managerId,
              type: 'a1_alert',
              title: 'A1 Alert: Too many urgent lots',
              body: `Depot "${depot.name}" has ${urgentLotCount} urgent lots (threshold: ${urgentCountThreshold}). These require immediate processing to meet SLA deadlines.`,
              payload: {
                depotId,
                urgentLotCount,
                thresholdCount: urgentCountThreshold,
              },
            });
          }
        }
      }
    } catch {
      // Rule not seeded yet — skip
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
