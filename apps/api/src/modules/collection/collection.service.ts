import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { CollectionRepository } from './collection.repository';
import { EventsService } from '../events/events.service';
import { NotificationsService } from '../notifications/notifications.service';
import { TransportService } from '../transport/transport.service';
import { LotsService } from '../lots/lots.service';
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
    @Inject(forwardRef(() => LotsService))
    private readonly lotsService: LotsService,
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
    profession?: string;
    regionId?: string;
    photoId?: string;
    shearingDate?: string;
    sheepBreed?: string;
    bagCount?: number;
    bagType?: 'PP' | 'jute';
    lastParasiteTreatmentDate?: string;
  }) {
    // 1. Find or create source for this user
    const sourceId = await this.ensureSourceForUser(data.userId, {
      surnom: data.surnom,
      mazraa: data.mazraa,
      profession: data.profession,
      regionId: data.regionId,
      latitude: data.latitude,
      longitude: data.longitude,
    });

    // 2. Create pre-lot with proper sourceId. createPreLot auto-issues a
    //    collection_job targeting the closest depot — that is what the
    //    collector app sees as an instruction.
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
          data.photoId ? `photoId: ${data.photoId}` : null,
          data.notes,
        ]
          .filter(Boolean)
          .join(' | ') || undefined,
      voiceNoteId: undefined,
      shearingDate: data.shearingDate,
      sheepBreed: data.sheepBreed,
      bagCount: data.bagCount,
      bagType: data.bagType,
      lastParasiteTreatmentDate: data.lastParasiteTreatmentDate,
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

    // Create a source record for this farmer (default profession: shepherd)
    const sourceId = uuid();
    await this.collectionRepository.createSource({
      id: sourceId,
      sourceType: 'c1_shepherd',
      profession: 'shepherd',
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
      profession?: string;
      regionId?: string;
      latitude?: string;
      longitude?: string;
    },
  ): Promise<string> {
    // Check if source already exists for this user — update profession/loc if newly provided
    const existing =
      await this.collectionRepository.findSourceByRegisteredBy(userId);
    if (existing) {
      const patch: Record<string, string> = {};
      if (details.profession && !existing.profession) patch.profession = details.profession;
      if (details.latitude && !existing.latitude) patch.latitude = details.latitude;
      if (details.longitude && !existing.longitude) patch.longitude = details.longitude;
      if (details.mazraa && !existing.address) patch.address = details.mazraa;
      if (Object.keys(patch).length > 0) {
        await this.collectionRepository.updateSource(existing.id, patch);
      }
      return existing.id;
    }

    // If no regionId provided, look up the user's regionId
    let regionId = details.regionId;
    if (!regionId) {
      const user = await this.collectionRepository.findUserById(userId);
      regionId = user?.regionId ?? undefined;
    }
    if (!regionId) {
      throw new BadRequestException('regionId is required to create a source');
    }

    // Map profession → legacy sourceType for backward compatibility
    const profession = details.profession ?? 'shepherd';
    const sourceType = professionToSourceType(profession);

    const sourceId = uuid();
    await this.collectionRepository.createSource({
      id: sourceId,
      sourceType,
      profession,
      name:
        details.surnom || details.mazraa || `فلاح-${userId.slice(0, 8)}`,
      regionId,
      latitude: details.latitude,
      longitude: details.longitude,
      address: details.mazraa,
      status: 'active',
      registeredBy: userId,
    });

    // Keep the shepherd details row for existing reads, but only if profession is shepherd
    if (profession === 'shepherd') {
      await this.collectionRepository.createShepherdDetails(sourceId, {
        hasSmartphone: true,
        preferredLanguage: 'ar',
      });
    }

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
    shearingDate?: string;
    sheepBreed?: string;
    bagCount?: number;
    bagType?: 'PP' | 'jute';
    lastParasiteTreatmentDate?: string;
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

    // Auto-issue a collection job to the closest depot. The collector app picks
    // it up from /collection/jobs as an instruction with start + destination.
    if (data.regionId) {
      try {
        await this.autoIssueCollectionJob({
          preLotId: id,
          sourceId: data.sourceId,
          regionId: data.regionId,
          originLat: data.locationLat,
          originLng: data.locationLng,
        });
      } catch (e) {
        this.logger.warn(`Auto-issue collection job failed for pre-lot ${id}: ${e}`);
      }
    }

    return preLot;
  }

  private async autoIssueCollectionJob(args: {
    preLotId: string;
    sourceId: string;
    regionId: string;
    originLat?: string;
    originLng?: string;
    urgency?: 'normal' | 'urgent';
    issuedBy?: string;
  }) {
    const depot = await this.collectionRepository.findClosestDepot(
      args.regionId,
      args.originLat,
      args.originLng,
    );
    if (!depot) {
      this.logger.warn(
        `No active depot found for region ${args.regionId}, skipping collection job`,
      );
      return null;
    }

    const job = await this.collectionRepository.createCollectionJob({
      id: uuid(),
      preLotId: args.preLotId,
      sourceId: args.sourceId,
      destinationDepotId: depot.id,
      urgency: args.urgency ?? 'normal',
      status: 'pending',
      originLat: args.originLat,
      originLng: args.originLng,
      issuedBy: args.issuedBy,
    });

    await this.eventsService.emit({
      eventType: 'collection.job.issued',
      aggregateType: 'collection_job',
      aggregateId: job.id,
      actorType: args.issuedBy ? 'user' : 'system',
      actorId: args.issuedBy,
      payload: {
        preLotId: args.preLotId,
        sourceId: args.sourceId,
        depotId: depot.id,
        urgency: job.urgency,
      },
      occurredAt: new Date(),
      version: 1,
    });

    this.logger.log(
      `Issued collection job ${job.id} for source ${args.sourceId} → depot ${depot.name}`,
    );

    return job;
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
    registeredBy?: string;
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

  // ── Collection Jobs ────────────────────────────────────────

  async listCollectionJobs(filters?: {
    status?: string | string[];
    collectorId?: string;
    depotId?: string;
    sourceId?: string;
    includeUnassignedOpen?: boolean;
  }) {
    const jobs = await this.collectionRepository.findCollectionJobs(filters);
    // Enrich with source + pre-lot info — the collector needs this on the list
    return Promise.all(
      jobs.map(async (job) => this.enrichCollectionJob(job)),
    );
  }

  async getCollectionJob(jobId: string) {
    const job = await this.collectionRepository.findCollectionJobById(jobId);
    if (!job) throw new NotFoundException(`Collection job ${jobId} not found`);
    return this.enrichCollectionJob(job);
  }

  private async enrichCollectionJob(job: any) {
    const [source, preLot, depot, gpsCount] = await Promise.all([
      this.collectionRepository.findSourceById(job.sourceId),
      this.collectionRepository.findPreLotById(job.preLotId),
      this.collectionRepository.findDepotById(job.destinationDepotId),
      Promise.resolve(0), // gps count not strictly needed in list view
    ]);
    return {
      ...job,
      source: source
        ? {
            id: source.id,
            name: source.name,
            profession: source.profession,
            sourceType: source.sourceType,
            contactPhone: source.contactPhone,
            address: source.address,
            latitude: source.latitude,
            longitude: source.longitude,
          }
        : null,
      preLot: preLot
        ? {
            id: preLot.id,
            estimatedWeightKg: preLot.estimatedWeightKg,
            notes: preLot.notes,
            locationLat: preLot.locationLat,
            locationLng: preLot.locationLng,
          }
        : null,
      depot: depot
        ? {
            id: depot.id,
            name: depot.name,
            address: (depot as any).address ?? null,
          }
        : null,
      gpsCount,
    };
  }

  async assignCollectionJob(
    jobId: string,
    collectorId: string,
    issuedBy?: string,
  ) {
    const job = await this.collectionRepository.findCollectionJobById(jobId);
    if (!job) throw new NotFoundException(`Collection job ${jobId} not found`);
    if (job.status !== 'pending' && job.status !== 'assigned') {
      throw new BadRequestException(
        `Cannot assign a job in status "${job.status}"`,
      );
    }
    const updated = await this.collectionRepository.updateCollectionJob(jobId, {
      collectorId,
      status: 'assigned',
      assignedAt: new Date(),
    });

    await this.eventsService.emit({
      eventType: 'collection.job.assigned',
      aggregateType: 'collection_job',
      aggregateId: jobId,
      actorType: issuedBy ? 'user' : 'system',
      actorId: issuedBy,
      payload: { collectorId },
      occurredAt: new Date(),
      version: 1,
    });

    await this.notificationsService.send({
      userId: collectorId,
      type: 'collection_job_assigned',
      title: 'مهمة جمع جديدة',
      body: 'لديك مهمة جمع جديدة، افتح التطبيق للتفاصيل',
      payload: { jobId },
    });

    return updated;
  }

  async acceptCollectionJob(jobId: string, collectorId: string) {
    const job = await this.collectionRepository.findCollectionJobById(jobId);
    if (!job) throw new NotFoundException(`Collection job ${jobId} not found`);
    if (job.collectorId && job.collectorId !== collectorId) {
      throw new ForbiddenException('Job is assigned to another collector');
    }
    if (!['pending', 'assigned'].includes(job.status)) {
      throw new BadRequestException(
        `Cannot accept a job in status "${job.status}"`,
      );
    }
    const updated = await this.collectionRepository.updateCollectionJob(jobId, {
      collectorId,
      status: 'accepted',
      acceptedAt: new Date(),
    });
    await this.eventsService.emit({
      eventType: 'collection.job.accepted',
      aggregateType: 'collection_job',
      aggregateId: jobId,
      actorType: 'collector',
      actorId: collectorId,
      payload: {},
      occurredAt: new Date(),
      version: 1,
    });
    return updated;
  }

  async startCollectionJob(jobId: string, collectorId: string) {
    const job = await this.collectionRepository.findCollectionJobById(jobId);
    if (!job) throw new NotFoundException(`Collection job ${jobId} not found`);
    if (job.collectorId !== collectorId) {
      throw new ForbiddenException('Not assigned to this collector');
    }
    if (job.status !== 'accepted' && job.status !== 'assigned') {
      throw new BadRequestException(
        `Cannot start a job in status "${job.status}"`,
      );
    }
    const updated = await this.collectionRepository.updateCollectionJob(jobId, {
      status: 'in_progress',
      startedAt: new Date(),
    });
    await this.eventsService.emit({
      eventType: 'collection.job.started',
      aggregateType: 'collection_job',
      aggregateId: jobId,
      actorType: 'collector',
      actorId: collectorId,
      payload: {},
      occurredAt: new Date(),
      version: 1,
    });
    return updated;
  }

  async submitCollectionJobGps(
    jobId: string,
    collectorId: string,
    points: Array<{
      lat: string;
      lng: string;
      speedMps?: string;
      accuracy?: string;
      recordedAt: string;
    }>,
  ) {
    const job = await this.collectionRepository.findCollectionJobById(jobId);
    if (!job) throw new NotFoundException(`Collection job ${jobId} not found`);
    if (job.collectorId !== collectorId) {
      throw new ForbiddenException('Not assigned to this collector');
    }
    if (points.length === 0) return [];
    return this.collectionRepository.addCollectionJobGps(
      jobId,
      points.map((p) => ({
        lat: p.lat,
        lng: p.lng,
        speedMps: p.speedMps,
        accuracy: p.accuracy,
        recordedAt: new Date(p.recordedAt),
      })),
    );
  }

  async markCollectionJobArrived(
    jobId: string,
    collectorId: string,
    location?: { lat: string; lng: string },
  ) {
    const job = await this.collectionRepository.findCollectionJobById(jobId);
    if (!job) throw new NotFoundException(`Collection job ${jobId} not found`);
    if (job.collectorId !== collectorId) {
      throw new ForbiddenException('Not assigned to this collector');
    }
    if (job.status !== 'in_progress') {
      throw new BadRequestException(
        `Cannot mark arrival on a job in status "${job.status}"`,
      );
    }
    const updated = await this.collectionRepository.updateCollectionJob(jobId, {
      status: 'arrived',
      arrivedAt: new Date(),
    });
    await this.eventsService.emit({
      eventType: 'collection.job.arrived',
      aggregateType: 'collection_job',
      aggregateId: jobId,
      actorType: 'collector',
      actorId: collectorId,
      payload: location ?? {},
      occurredAt: new Date(),
      version: 1,
    });
    return updated;
  }

  async completeCollectionJob(
    jobId: string,
    collectorId: string,
    arrival: {
      actualWeightKg: string;
      stateQuick?: 'clean' | 'dirty' | 'very_dirty' | 'contaminated' | 'with_meat';
      coldChainTempC?: string;
      gpsLat?: string;
      gpsLng?: string;
      notes?: string;
      qrCode?: string;
      isUrgent?: boolean;
    },
  ) {
    const job = await this.collectionRepository.findCollectionJobById(jobId);
    if (!job) throw new NotFoundException(`Collection job ${jobId} not found`);
    if (job.collectorId !== collectorId) {
      throw new ForbiddenException('Not assigned to this collector');
    }
    if (!['arrived', 'in_progress'].includes(job.status)) {
      throw new BadRequestException(
        `Cannot complete a job in status "${job.status}"`,
      );
    }

    const source = await this.collectionRepository.findSourceById(job.sourceId);
    const sourceType = source?.sourceType ?? 'c1_shepherd';

    // Create the lot — this is where the lot enters the system officially.
    const qrCode = arrival.qrCode ?? `LOT-${jobId.slice(0, 8)}-${Date.now().toString(36)}`;
    const lot = await this.lotsService.createLot(
      {
        sourceId: job.sourceId,
        sourceType: sourceType as any,
        collectorId,
        qrCode,
        declaredWeightKg: job.preLotId
          ? (await this.collectionRepository.findPreLotById(job.preLotId))
              ?.estimatedWeightKg ?? undefined
          : undefined,
        stateQuick: arrival.stateQuick,
        urgency: job.urgency as any,
        coldChainTempC: arrival.coldChainTempC,
        gpsLat: arrival.gpsLat ?? job.originLat ?? undefined,
        gpsLng: arrival.gpsLng ?? job.originLng ?? undefined,
        isUrgent: arrival.isUrgent ?? job.urgency === 'urgent',
        preLotId: job.preLotId,
        notes: arrival.notes,
        initialWeigh: {
          weightKg: arrival.actualWeightKg,
          source: 'manual',
        },
      },
      collectorId,
    );

    // Mark pre-lot as collected (the existing flow expects status `assigned` →
    // `collected`, so we transition through both)
    if (job.preLotId) {
      const preLot = await this.collectionRepository.findPreLotById(job.preLotId);
      if (preLot && preLot.status === 'announced') {
        await this.collectionRepository.updatePreLot(job.preLotId, {
          status: 'assigned',
          assignedCollectorId: collectorId,
        });
      }
      await this.collectionRepository.updatePreLot(job.preLotId, {
        status: 'collected',
        lotId: lot.id,
      });
    }

    const updated = await this.collectionRepository.updateCollectionJob(jobId, {
      status: 'completed',
      completedAt: new Date(),
      lotId: lot.id,
    });

    await this.eventsService.emit({
      eventType: 'collection.job.completed',
      aggregateType: 'collection_job',
      aggregateId: jobId,
      actorType: 'collector',
      actorId: collectorId,
      payload: {
        lotId: lot.id,
        depotId: job.destinationDepotId,
        actualWeightKg: arrival.actualWeightKg,
      },
      occurredAt: new Date(),
      version: 1,
    });

    return { job: updated, lot };
  }

  async cancelCollectionJob(jobId: string, reason?: string, actorId?: string) {
    const job = await this.collectionRepository.findCollectionJobById(jobId);
    if (!job) throw new NotFoundException(`Collection job ${jobId} not found`);
    if (job.status === 'completed' || job.status === 'cancelled') {
      throw new BadRequestException(
        `Cannot cancel a job in status "${job.status}"`,
      );
    }
    const updated = await this.collectionRepository.updateCollectionJob(jobId, {
      status: 'cancelled',
      cancelledAt: new Date(),
      cancelReason: reason,
    });
    await this.eventsService.emit({
      eventType: 'collection.job.cancelled',
      aggregateType: 'collection_job',
      aggregateId: jobId,
      actorType: actorId ? 'user' : 'system',
      actorId,
      payload: { reason: reason ?? null },
      occurredAt: new Date(),
      version: 1,
    });
    return updated;
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

function professionToSourceType(
  profession: string,
): 'c1_shepherd' | 'c2_slaughterhouse' | 'c3_aggregator' {
  switch (profession) {
    case 'slaughterhouse':
    case 'butcher':
      return 'c2_slaughterhouse';
    case 'aggregator':
      return 'c3_aggregator';
    case 'shepherd':
    case 'other':
    default:
      return 'c1_shepherd';
  }
}
