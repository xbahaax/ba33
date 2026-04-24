import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { CollectionRepository } from './collection.repository';
import { EventsService } from '../events/events.service';
import { NotificationsService } from '../notifications/notifications.service';
import { TransportService } from '../transport/transport.service';
import { v4 as uuid } from 'uuid';

@Injectable()
export class CollectionService {
  private readonly logger = new Logger(CollectionService.name);

  constructor(
    private readonly collectionRepository: CollectionRepository,
    private readonly eventsService: EventsService,
    private readonly notificationsService: NotificationsService,
    @Inject(forwardRef(() => TransportService))
    private readonly transportService: TransportService,
  ) {}

  // ── Shepherd Declaration ─────────────────────────────────

  async declareWool(data: {
    userId: string;
    estimatedWeightKg: string;
    latitude?: string;
    longitude?: string;
    notes?: string;
    surnom?: string;
    mazraa?: string;
    regionId?: string;
    photoId?: string;
  }) {
    // 1. Find or create source for this user
    const sourceId = await this.ensureSourceForUser(data.userId, {
      surnom: data.surnom,
      mazraa: data.mazraa,
      regionId: data.regionId,
      latitude: data.latitude,
      longitude: data.longitude,
    });

    // 2. Create pre-lot with proper sourceId
    return this.createPreLot({
      sourceId,
      estimatedWeightKg: data.estimatedWeightKg,
      locationLat: data.latitude,
      locationLng: data.longitude,
      regionId: data.regionId,
      notes:
        [
          data.surnom ? `surnom: ${data.surnom}` : null,
          data.mazraa ? `mazraa: ${data.mazraa}` : null,
          data.notes,
        ]
          .filter(Boolean)
          .join(' | ') || undefined,
      voiceNoteId: undefined,
    });
  }

  // ── On-Behalf Declaration (transporter / collector) ────

  async declareWoolOnBehalf(data: {
    farmerName: string;
    farmerPhone?: string;
    estimatedWeightKg: string;
    estimatedRange?: string;
    latitude?: string;
    longitude?: string;
    notes?: string;
    surnom?: string;
    mazraa?: string;
    regionId?: string;
    photoId?: string;
    declaringUserId: string;
  }) {
    // Resolve regionId from declaring user if not provided
    let regionId = data.regionId;
    if (!regionId) {
      const user = await this.collectionRepository.findUserById(
        data.declaringUserId,
      );
      regionId = user?.regionId ?? undefined;
    }
    if (!regionId) {
      throw new BadRequestException(
        'regionId is required — provide it or ensure the declaring user has one',
      );
    }

    // Create a source record for this farmer
    const sourceId = uuid();
    await this.collectionRepository.createSource({
      id: sourceId,
      sourceType: 'c1_shepherd',
      name: data.farmerName,
      contactPhone: data.farmerPhone,
      regionId,
      latitude: data.latitude,
      longitude: data.longitude,
      address: data.mazraa,
      status: 'active',
      registeredBy: data.declaringUserId,
    });

    // Build notes
    const notesParts = [
      data.surnom ? `surnom: ${data.surnom}` : null,
      data.mazraa ? `mazraa: ${data.mazraa}` : null,
      data.farmerPhone ? `tel: ${data.farmerPhone}` : null,
      data.photoId ? `photoId: ${data.photoId}` : null,
      data.notes,
    ]
      .filter(Boolean)
      .join(' | ') || undefined;

    // Create pre-lot (which auto-dispatches transport job)
    return this.createPreLot({
      sourceId,
      estimatedWeightKg: data.estimatedWeightKg,
      estimatedRange: data.estimatedRange,
      locationLat: data.latitude,
      locationLng: data.longitude,
      regionId,
      notes: notesParts,
      voiceNoteId: undefined,
    });
  }

  private async ensureSourceForUser(
    userId: string,
    details: {
      surnom?: string;
      mazraa?: string;
      regionId?: string;
      latitude?: string;
      longitude?: string;
    },
  ): Promise<string> {
    // Check if source already exists for this user
    const existing =
      await this.collectionRepository.findSourceByRegisteredBy(userId);
    if (existing) return existing.id;

    // If no regionId provided, look up the user's regionId
    let regionId = details.regionId;
    if (!regionId) {
      const user = await this.collectionRepository.findUserById(userId);
      regionId = user?.regionId ?? undefined;
    }
    if (!regionId) {
      throw new BadRequestException('regionId is required to create a source');
    }

    // Create a new source record for this shepherd
    const sourceId = uuid();
    await this.collectionRepository.createSource({
      id: sourceId,
      sourceType: 'c1_shepherd',
      name:
        details.surnom || details.mazraa || `فلاح-${userId.slice(0, 8)}`,
      regionId,
      latitude: details.latitude,
      longitude: details.longitude,
      address: details.mazraa,
      status: 'active',
      registeredBy: userId,
    });

    // Create shepherd details record
    await this.collectionRepository.createShepherdDetails(sourceId, {
      hasSmartphone: true,
      preferredLanguage: 'ar',
    });

    return sourceId;
  }

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

    // Auto-dispatch: create transport job for pickup
    if (data.regionId) {
      try {
        await this.autoDispatchTransportJob(
          data.sourceId,
          data.regionId,
          data.locationLat,
          data.locationLng,
        );
      } catch (e) {
        this.logger.warn(`Auto-dispatch failed for pre-lot ${id}: ${e}`);
      }
    }

    return preLot;
  }

  private async autoDispatchTransportJob(
    sourceId: string,
    regionId: string,
    sourceLat?: string,
    sourceLng?: string,
  ) {
    // Find the closest depot using geo-distance, fallback to region match
    const depot = await this.collectionRepository.findClosestDepot(
      regionId,
      sourceLat,
      sourceLng,
    );
    if (!depot) {
      this.logger.warn(`No active depot found for region ${regionId}, skipping auto-dispatch`);
      return;
    }

    // Find an available transporter in this region
    const transporterId = await this.transportService.findTransporterForRegion(regionId);

    if (!transporterId) {
      this.logger.warn(`No active transporter in region ${regionId}, creating unassigned job`);
    }

    // Create the transport job
    const job = await this.transportService.createJob({
      originType: 'source',
      originId: sourceId,
      destinationType: 'depot',
      destinationId: depot.id,
      lane: 'normal',
    });

    // If we found a transporter, assign them directly
    if (transporterId) {
      await this.transportService.acceptJob(job.id, transporterId);

      await this.notificationsService.send({
        userId: transporterId,
        type: 'transport_job_assigned',
        title: 'مهمة نقل جديدة',
        body: `مهمة جديدة: اجمع الصوف من المصدر و وصلو للمستودع ${depot.name}`,
        payload: { jobId: job.id, sourceId, depotId: depot.id },
      });
    }

    this.logger.log(`Auto-dispatched transport job ${job.id} for source ${sourceId} → depot ${depot.name}${transporterId ? ` → transporter ${transporterId}` : ' (unassigned)'}`);
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

    // Notify the shepherd about the scheduled pickup
    const source = await this.collectionRepository.findSourceById(preLot.sourceId);
    if (source?.registeredBy) {
      await this.notificationsService.send({
        userId: source.registeredBy,
        type: 'prelot_assigned',
        title: 'Collecte programmée',
        body: `Un collecteur viendra récupérer votre laine le ${scheduledAt.toLocaleDateString('fr-DZ')}.`,
        payload: {
          preLotId,
          collectorId,
          scheduledAt: scheduledAt.toISOString(),
        },
      });
    }

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

  // ── Pre-Lot Expiration ─────────────────────────────────

  async expireStalePreLots(maxAgeHours = 72) {
    const cutoff = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);
    const stale = await this.collectionRepository.findStalePreLots(cutoff);

    const expired: string[] = [];
    for (const preLot of stale) {
      await this.collectionRepository.updatePreLot(preLot.id, {
        status: 'expired' as any,
      });

      await this.eventsService.emit({
        eventType: 'collection.prelot.expired',
        aggregateType: 'prelot',
        aggregateId: preLot.id,
        actorType: 'system',
        payload: {
          reason: `Pre-lot exceeded ${maxAgeHours}h without completion`,
          createdAt: preLot.createdAt,
        },
        occurredAt: new Date(),
        version: 1,
      });

      expired.push(preLot.id);
    }

    return { expired, count: expired.length };
  }
}
