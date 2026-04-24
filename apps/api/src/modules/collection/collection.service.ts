import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CollectionRepository } from './collection.repository';
import { EventsService } from '../events/events.service';
import { v4 as uuid } from 'uuid';

@Injectable()
export class CollectionService {
  constructor(
    private readonly collectionRepository: CollectionRepository,
    private readonly eventsService: EventsService,
  ) {}

  // ── Pre-Lots ──────────────────────────────────────────────

  async createPreLot(data: {
    sourceId: string;
    estimatedWeightKg: string;
    estimatedRange?: string;
    locationLat?: string;
    locationLng?: string;
    regionId?: string;
    notes?: string;
    voiceNoteId?: string;
  }) {
    const id = uuid();
    const preLot = await this.collectionRepository.createPreLot({
      id,
      ...data,
      status: 'announced',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.eventsService.emit({
      eventType: 'collection.prelot.announced',
      aggregateType: 'prelot',
      aggregateId: id,
      actorType: 'source',
      payload: {
        sourceId: data.sourceId,
        estimatedWeightKg: data.estimatedWeightKg,
        regionId: data.regionId,
      },
      occurredAt: new Date(),
      version: 1,
    });

    return preLot;
  }

  async getPreLot(id: string) {
    const preLot = await this.collectionRepository.findPreLotById(id);
    if (!preLot) {
      throw new NotFoundException(`Pre-lot ${id} not found`);
    }
    return preLot;
  }

  async listPreLots(filters?: {
    status?: string;
    assignedCollectorId?: string;
    regionId?: string;
  }) {
    return this.collectionRepository.findPreLots(filters);
  }

  async assignPreLot(
    preLotId: string,
    collectorId: string,
    scheduledAt: Date,
  ) {
    const preLot = await this.getPreLot(preLotId);

    if (preLot.status !== 'announced') {
      throw new BadRequestException(
        `Pre-lot is in status "${preLot.status}", cannot assign`,
      );
    }

    const updated = await this.collectionRepository.updatePreLot(preLotId, {
      status: 'assigned',
      assignedCollectorId: collectorId,
      scheduledAt,
    });

    await this.eventsService.emit({
      eventType: 'collection.prelot.assigned',
      aggregateType: 'prelot',
      aggregateId: preLotId,
      actorId: collectorId,
      actorType: 'collector',
      payload: { collectorId, scheduledAt: scheduledAt.toISOString() },
      occurredAt: new Date(),
      version: 1,
    });

    return updated;
  }

  async completePreLot(preLotId: string, lotId: string) {
    const preLot = await this.getPreLot(preLotId);

    if (preLot.status !== 'assigned') {
      throw new BadRequestException(
        `Pre-lot is in status "${preLot.status}", cannot complete`,
      );
    }

    const updated = await this.collectionRepository.updatePreLot(preLotId, {
      status: 'collected',
      lotId,
    });

    await this.eventsService.emit({
      eventType: 'collection.prelot.collected',
      aggregateType: 'prelot',
      aggregateId: preLotId,
      actorId: preLot.assignedCollectorId ?? undefined,
      actorType: 'collector',
      payload: { lotId },
      occurredAt: new Date(),
      version: 1,
    });

    return updated;
  }

  async cancelPreLot(preLotId: string, reason?: string) {
    const preLot = await this.getPreLot(preLotId);

    if (preLot.status === 'collected' || preLot.status === 'cancelled') {
      throw new BadRequestException(
        `Pre-lot is in status "${preLot.status}", cannot cancel`,
      );
    }

    const updated = await this.collectionRepository.updatePreLot(preLotId, {
      status: 'cancelled',
    });

    await this.eventsService.emit({
      eventType: 'collection.prelot.cancelled',
      aggregateType: 'prelot',
      aggregateId: preLotId,
      actorType: 'system',
      payload: { reason: reason ?? null },
      occurredAt: new Date(),
      version: 1,
    });

    return updated;
  }

  // ── Collectors ────────────────────────────────────────────

  async createCollector(
    userId: string,
    regions: string[],
    certs: unknown,
  ) {
    return this.collectionRepository.createCollector({
      userId,
      assignedRegions: regions,
      certifications: certs,
      active: true,
    });
  }

  async getCollectorProfile(userId: string) {
    const collector =
      await this.collectionRepository.findCollectorByUserId(userId);
    if (!collector) {
      throw new NotFoundException(`Collector profile not found for user ${userId}`);
    }
    return collector;
  }

  // ── Routes ────────────────────────────────────────────────

  async createRoute(collectorId: string, date: Date) {
    const id = uuid();
    const route = await this.collectionRepository.createRoute({
      id,
      collectorId,
      date,
      status: 'planned',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.eventsService.emit({
      eventType: 'collection.route.planned',
      aggregateType: 'route',
      aggregateId: id,
      actorId: collectorId,
      actorType: 'collector',
      payload: { date: date.toISOString() },
      occurredAt: new Date(),
      version: 1,
    });

    return route;
  }

  async getRoute(id: string) {
    const route = await this.collectionRepository.findRouteById(id);
    if (!route) {
      throw new NotFoundException(`Route ${id} not found`);
    }

    const stops = await this.collectionRepository.findRouteStops(id);
    return { ...route, stops };
  }

  async getCollectorRoutes(collectorId: string, date?: Date) {
    return this.collectionRepository.findRoutesForCollector(collectorId, date);
  }

  async completeRouteStop(stopId: string, arrivalTime: Date) {
    const updated = await this.collectionRepository.updateRouteStop(stopId, {
      status: 'completed',
      arrivalTime,
    });

    if (!updated) {
      throw new NotFoundException(`Route stop ${stopId} not found`);
    }

    return updated;
  }

  // ── Booklets ──────────────────────────────────────────────

  async issueBooklet(
    collectorId: string,
    serialStart: string,
    serialEnd: string,
  ) {
    return this.collectionRepository.createBooklet({
      id: uuid(),
      collectorId,
      serialStart,
      serialEnd,
      issuedAt: new Date(),
    });
  }
}
