import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CollectionRepository } from './collection.repository';
import { v4 as uuid } from 'uuid';

@Injectable()
export class CollectionService {
  constructor(private readonly collectionRepository: CollectionRepository) {}

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
    return this.collectionRepository.createPreLot({
      id: uuid(),
      ...data,
      status: 'announced',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
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

    return this.collectionRepository.updatePreLot(preLotId, {
      status: 'assigned',
      assignedCollectorId: collectorId,
      scheduledAt,
    });
  }

  async completePreLot(preLotId: string, lotId: string) {
    const preLot = await this.getPreLot(preLotId);

    if (preLot.status !== 'assigned') {
      throw new BadRequestException(
        `Pre-lot is in status "${preLot.status}", cannot complete`,
      );
    }

    return this.collectionRepository.updatePreLot(preLotId, {
      status: 'collected',
      lotId,
    });
  }

  async cancelPreLot(preLotId: string, reason?: string) {
    const preLot = await this.getPreLot(preLotId);

    if (preLot.status === 'collected' || preLot.status === 'cancelled') {
      throw new BadRequestException(
        `Pre-lot is in status "${preLot.status}", cannot cancel`,
      );
    }

    return this.collectionRepository.updatePreLot(preLotId, {
      status: 'cancelled',
    });
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
    return this.collectionRepository.createRoute({
      id: uuid(),
      collectorId,
      date,
      status: 'planned',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
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
