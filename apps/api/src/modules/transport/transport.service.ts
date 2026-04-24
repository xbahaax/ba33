import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { TransportRepository } from './transport.repository';
import { AdvanceTransportJobDto } from './dto/advance-transport-job.dto';
import { EventsService } from '../events/events.service';
import { RulesService } from '../rules/rules.service';
import { NotificationsService } from '../notifications/notifications.service';
import { LotsService } from '../lots/lots.service';
import { DepotService } from '../depot/depot.service';
import { v4 as uuid } from 'uuid';

@Injectable()
export class TransportService {
  private readonly logger = new Logger(TransportService.name);

  constructor(
    private readonly transportRepository: TransportRepository,
    private readonly eventsService: EventsService,
    private readonly rulesService: RulesService,
    private readonly notificationsService: NotificationsService,
    private readonly lotsService: LotsService,
    private readonly depotService: DepotService,
  ) {}

  // ── Jobs ──────────────────────────────────────────────────

  async createJob(data: {
    originType: string;
    originId: string;
    destinationType: string;
    destinationId: string;
    lane: 'normal' | 'urgent_cold_chain' | 'urgent_standard';
    slaDeadline?: Date;
  }) {
    // Compute SLA deadline from rules if not explicitly provided
    let slaDeadline = data.slaDeadline;
    if (!slaDeadline) {
      const ruleKey =
        data.lane === 'normal'
          ? 'sla.c1_pickup_hours'
          : 'sla.c2_pickup_hours';
      try {
        const slaHours = await this.rulesService.getRuleValue<number>(ruleKey);
        slaDeadline = new Date(Date.now() + slaHours * 60 * 60 * 1000);
        this.logger.log(
          `SLA deadline computed: ${slaHours}h from now (${ruleKey}) → ${slaDeadline.toISOString()}`,
        );
      } catch {
        // Rule not seeded yet — proceed without SLA
        this.logger.warn(`SLA rule "${ruleKey}" not found, skipping deadline`);
      }
    }

    const job = await this.transportRepository.createJob({
      id: uuid(),
      ...data,
      slaDeadline,
      status: 'pending',
      requestedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.eventsService.emit({
      eventType: 'transport.job.created',
      aggregateType: 'transport_job',
      aggregateId: job.id,
      actorType: 'system',
      payload: { lane: data.lane, slaDeadline: slaDeadline?.toISOString() },
      occurredAt: new Date(),
      version: 1,
    });

    return job;
  }

  async getJob(id: string) {
    const job = await this.transportRepository.findJobById(id);
    if (!job) {
      throw new NotFoundException(`Transport job ${id} not found`);
    }

    const lots = await this.transportRepository.findJobLots(id);
    return { ...job, lots };
  }

  async listJobs(filters?: {
    transporterId?: string;
    status?: string;
    lane?: string;
  }) {
    const jobs = await this.transportRepository.findJobs(filters);

    // Enrich each job with its lots + pre-lot estimated weight for source-origin jobs
    const enriched = await Promise.all(
      jobs.map(async (job) => {
        const lots = await this.transportRepository.findJobLots(job.id);

        // For source-origin jobs with no real lots, find the pre-lot
        // created around the same time as this job (the one that triggered it)
        if (job.originType === 'source' && lots.length === 0) {
          const preLot = await this.transportRepository.findPreLotForJob(
            job.originId,
            job.createdAt,
          );
          if (preLot) {
            return {
              ...job,
              lots: [{
                id: preLot.id,
                qrCode: `PRELOT-${preLot.id.slice(0, 8)}`,
                sourceType: 'c1_shepherd',
                declaredWeight: parseFloat(preLot.estimatedWeightKg ?? '0'),
                loadedWeight: null,
                deliveredWeight: null,
                isLoaded: false,
                isDelivered: false,
              }],
            };
          }
        }

        return { ...job, lots };
      }),
    );

    return enriched;
  }

  async acceptJob(jobId: string, transporterId: string) {
    const job = await this.transportRepository.findJobById(jobId);
    if (!job) {
      throw new NotFoundException(`Transport job ${jobId} not found`);
    }

    if (job.status !== 'pending' && job.status !== 'assigned') {
      throw new BadRequestException(
        `Job is in status "${job.status}", cannot accept`,
      );
    }

    const updated = await this.transportRepository.updateJob(jobId, {
      status: 'accepted',
      transporterId,
      acceptedAt: new Date(),
    });

    await this.eventsService.emit({
      eventType: 'transport.job.accepted',
      aggregateType: 'transport_job',
      aggregateId: jobId,
      actorId: transporterId,
      actorType: 'transporter',
      payload: { transporterId },
      occurredAt: new Date(),
      version: 1,
    });

    return updated;
  }

  async startJob(jobId: string) {
    const job = await this.transportRepository.findJobById(jobId);
    if (!job) {
      throw new NotFoundException(`Transport job ${jobId} not found`);
    }

    if (job.status !== 'accepted') {
      throw new BadRequestException(
        `Job is in status "${job.status}", cannot start`,
      );
    }

    const updated = await this.transportRepository.updateJob(jobId, {
      status: 'in_progress',
    });

    await this.eventsService.emit({
      eventType: 'transport.job.started',
      aggregateType: 'transport_job',
      aggregateId: jobId,
      actorId: job.transporterId ?? undefined,
      actorType: 'transporter',
      payload: {},
      occurredAt: new Date(),
      version: 1,
    });

    return updated;
  }

  async loadLot(jobId: string, lotId: string, weight: string) {
    // Ensure the job exists
    const job = await this.transportRepository.findJobById(jobId);
    if (!job) {
      throw new NotFoundException(`Transport job ${jobId} not found`);
    }

    // Add the lot to the job (or update if it already exists)
    try {
      await this.transportRepository.addJobLot(jobId, lotId);
    } catch {
      // Lot may already be linked — that's fine, we'll update it
    }

    const updated = await this.transportRepository.updateJobLot(
      jobId,
      lotId,
      {
        loadedWeightKg: weight,
        loadedAt: new Date(),
      },
    );

    // Update lot status and location → in transit on this job
    await this.lotsService.updateLotStatus(lotId, 'in_transit', job.transporterId ?? 'system');
    await this.lotsService.updateLocation(lotId, jobId, 'transport_job');

    await this.eventsService.emit({
      eventType: 'transport.lot.loaded',
      aggregateType: 'transport_job',
      aggregateId: jobId,
      actorId: job.transporterId ?? undefined,
      actorType: 'transporter',
      payload: { lotId, loadedWeightKg: weight },
      occurredAt: new Date(),
      version: 1,
    });

    return updated;
  }

  async deliverLot(jobId: string, lotId: string, weight: string) {
    const job = await this.transportRepository.findJobById(jobId);
    if (!job) {
      throw new NotFoundException(`Transport job ${jobId} not found`);
    }

    const updated = await this.transportRepository.updateJobLot(
      jobId,
      lotId,
      {
        deliveredWeightKg: weight,
        deliveredAt: new Date(),
      },
    );

    if (!updated) {
      throw new NotFoundException(
        `Lot ${lotId} not found in job ${jobId}`,
      );
    }

    // Check weight mismatch
    const loadedWeight = parseFloat(updated.loadedWeightKg ?? '0');
    const deliveredWeight = parseFloat(weight);
    const mismatchPct =
      loadedWeight > 0
        ? Math.abs(deliveredWeight - loadedWeight) / loadedWeight
        : 0;

    const payload: Record<string, unknown> = {
      lotId,
      deliveredWeightKg: weight,
      loadedWeightKg: updated.loadedWeightKg,
    };

    if (mismatchPct > 0.02) {
      payload.weightMismatch = true;
      payload.mismatchPercent = (mismatchPct * 100).toFixed(2);

      // Notify transporter about weight mismatch
      if (job.transporterId) {
        await this.notificationsService.send({
          userId: job.transporterId,
          type: 'weight_mismatch',
          title: 'Weight mismatch detected on delivery',
          body: `Lot ${lotId} in job ${jobId}: loaded ${loadedWeight}kg but delivered ${deliveredWeight}kg (${(mismatchPct * 100).toFixed(2)}% discrepancy, exceeds 2% tolerance).`,
          payload: {
            jobId,
            lotId,
            loadedWeightKg: loadedWeight,
            deliveredWeightKg: deliveredWeight,
            mismatchPercent: mismatchPct * 100,
          },
        });
      }
    }

    // Update lot location to destination
    await this.lotsService.updateLocation(
      lotId,
      job.destinationId,
      job.destinationType,
    );

    // Update lot status to received_depot (mirrors loadLot → in_transit)
    if (job.destinationType === 'depot') {
      await this.lotsService.updateLotStatus(
        lotId,
        'received_depot',
        job.transporterId ?? 'system',
      );
    }

    await this.eventsService.emit({
      eventType: 'transport.lot.delivered',
      aggregateType: 'transport_job',
      aggregateId: jobId,
      actorId: job.transporterId ?? undefined,
      actorType: 'transporter',
      payload,
      occurredAt: new Date(),
      version: 1,
    });

    return { ...updated, weightMismatch: mismatchPct > 0.02, mismatchPercent: mismatchPct * 100 };
  }

  async completeJob(jobId: string) {
    const job = await this.transportRepository.findJobById(jobId);
    if (!job) {
      throw new NotFoundException(`Transport job ${jobId} not found`);
    }

    if (job.status !== 'in_progress') {
      throw new BadRequestException(
        `Job is in status "${job.status}", cannot complete`,
      );
    }

    const completedAt = new Date();
    const slaBreached =
      job.slaDeadline != null ? completedAt > new Date(job.slaDeadline as string | Date) : false;

    const updated = await this.transportRepository.updateJob(jobId, {
      status: 'delivered',
      completedAt,
    });

    const payload: Record<string, unknown> = {};
    if (slaBreached) {
      payload.slaBreached = true;
      payload.slaDeadline = job.slaDeadline;
      payload.completedAt = completedAt.toISOString();

      this.logger.warn(
        `SLA breached for job ${jobId}: deadline was ${job.slaDeadline}, completed at ${completedAt.toISOString()}`,
      );

      // Notify the transporter about SLA breach
      if (job.transporterId) {
        await this.notificationsService.send({
          userId: job.transporterId,
          type: 'sla_warning',
          title: 'SLA deadline breached',
          body: `Transport job ${jobId} was completed after the SLA deadline. Deadline: ${new Date(job.slaDeadline!).toISOString()}, Completed: ${completedAt.toISOString()}.`,
          payload: {
            jobId,
            slaDeadline: job.slaDeadline,
            completedAt: completedAt.toISOString(),
            lane: job.lane,
          },
        });
      }
    }

    // Auto-receive all delivered lots at the destination depot
    if (job.destinationType === 'depot') {
      const lots = await this.transportRepository.findJobLots(jobId);
      for (const lot of lots) {
        if (lot.deliveredWeightKg) {
          try {
            await this.depotService.receiveLot(
              {
                depotId: job.destinationId,
                lotId: lot.lotId,
                actualWeightKg: parseFloat(lot.deliveredWeightKg),
              },
              job.transporterId ?? 'system',
              'transporter',
            );
          } catch (e) {
            this.logger.warn(
              `Auto depot receive failed for lot ${lot.lotId} in job ${jobId}: ${e}`,
            );
          }
        }
      }
    }

    await this.eventsService.emit({
      eventType: 'transport.job.completed',
      aggregateType: 'transport_job',
      aggregateId: jobId,
      actorId: job.transporterId ?? undefined,
      actorType: 'transporter',
      payload,
      occurredAt: completedAt,
      version: 1,
    });

    return { ...updated, slaBreached };
  }

  // ── GPS ───────────────────────────────────────────────────

  async addGpsPoint(
    jobId: string,
    lat: string,
    lng: string,
    temperatureC?: string,
  ) {
    const point = await this.transportRepository.addGpsPoint({
      id: uuid(),
      jobId,
      lat,
      lng,
      temperatureC: temperatureC ?? null,
      recordedAt: new Date(),
    });

    // Cold chain temperature breach detection
    if (temperatureC != null) {
      const temp = parseFloat(temperatureC);
      const job = await this.transportRepository.findJobById(jobId);

      if (job && job.lane === 'urgent_cold_chain' && (temp > 8 || temp < 0)) {
        this.logger.warn(
          `Cold chain breach on job ${jobId}: ${temp}°C (safe range: 0-8°C)`,
        );

        if (job.transporterId) {
          await this.notificationsService.send({
            userId: job.transporterId,
            type: 'a1_alert',
            title: 'Cold chain temperature breach',
            body: `Transport job ${jobId}: temperature recorded at ${temp}°C, outside safe range (0-8°C). Check refrigeration immediately.`,
            payload: {
              jobId,
              temperatureC: temp,
              lat,
              lng,
              safeRangeMin: 0,
              safeRangeMax: 8,
            },
          });
        }

        await this.eventsService.emit({
          eventType: 'transport.cold_chain.breach',
          aggregateType: 'transport_job',
          aggregateId: jobId,
          actorType: 'system',
          payload: { temperatureC: temp, lat, lng },
          occurredAt: new Date(),
          version: 1,
        });
      }
    }

    return point;
  }

  async getGpsTrail(jobId: string) {
    return this.transportRepository.findGpsPoints(jobId);
  }

  // ── Transporters ──────────────────────────────────────────

  // ── Pickup Confirmation (pre-lot → lot) ──────────────────

  async confirmPickup(
    jobId: string,
    data: { weight: string; stateQuick?: string; notes?: string },
  ) {
    const job = await this.transportRepository.findJobById(jobId);
    if (!job) {
      throw new NotFoundException(`Transport job ${jobId} not found`);
    }

    if (job.originType !== 'source') {
      throw new BadRequestException('Pickup confirmation is only for source-origin jobs');
    }

    // Find the pre-lot that triggered this job
    const preLot = await this.transportRepository.findPreLotForJob(
      job.originId,
      job.createdAt,
    );
    if (!preLot) {
      throw new NotFoundException('No pre-lot found for this job');
    }

    // Generate QR code automatically: BA33-{short UUID}
    const qrCode = `BA33-${uuid().slice(0, 8).toUpperCase()}`;

    // Create a real lot from the pre-lot
    const lot = await this.lotsService.createLot(
      {
        sourceId: preLot.sourceId,
        sourceType: 'c1_shepherd',
        collectorId: job.transporterId ?? undefined,
        qrCode,
        declaredWeightKg: preLot.estimatedWeightKg,
        stateQuick: (data.stateQuick as any) ?? 'clean',
        gpsLat: preLot.locationLat ?? undefined,
        gpsLng: preLot.locationLng ?? undefined,
        preLotId: preLot.id,
        notes: data.notes ?? preLot.notes ?? undefined,
        initialWeigh: {
          weightKg: data.weight,
          source: 'manual',
        },
      },
      job.transporterId ?? 'system',
    );

    // Link the lot to the transport job + record weigh-in
    try {
      await this.transportRepository.addJobLot(jobId, lot.id);
    } catch {
      // Already linked
    }
    await this.transportRepository.updateJobLot(jobId, lot.id, {
      loadedWeightKg: data.weight,
      loadedAt: new Date(),
    });

    // Update lot status to in_transit
    await this.lotsService.updateLotStatus(lot.id, 'in_transit', job.transporterId ?? 'system');

    // Complete the pre-lot
    await this.transportRepository.completePreLot(preLot.id, lot.id);

    await this.eventsService.emit({
      eventType: 'transport.pickup.confirmed',
      aggregateType: 'transport_job',
      aggregateId: jobId,
      actorId: job.transporterId ?? undefined,
      actorType: 'transporter',
      payload: {
        preLotId: preLot.id,
        lotId: lot.id,
        qrCode,
        weight: data.weight,
        estimatedWeight: preLot.estimatedWeightKg,
      },
      occurredAt: new Date(),
      version: 1,
    });

    this.logger.log(
      `Pickup confirmed for job ${jobId}: pre-lot ${preLot.id} → lot ${lot.id} (QR: ${qrCode}, weight: ${data.weight}kg)`,
    );

    return {
      lotId: lot.id,
      qrCode,
      declaredWeight: preLot.estimatedWeightKg,
      actualWeight: data.weight,
      preLotId: preLot.id,
    };
  }

  async findTransporterForRegion(regionId: string): Promise<string | null> {
    const rows = await this.transportRepository.findActiveTransportersByRegion(regionId);
    return rows.length > 0 ? rows[0].userId : null;
  }

  async createTransporter(
    userId: string,
    vehicleInfo: unknown,
    certs: unknown,
  ) {
    return this.transportRepository.createTransporter({
      userId,
      vehicleInfo,
      certifications: certs,
      active: true,
    });
  }

  getOverview() {
    return this.transportRepository.getOverview();
  }

  advanceJob(jobId: string, input: AdvanceTransportJobDto, actorId: string, actorType: string) {
    return this.transportRepository.advanceJob(jobId, input, actorId, actorType);
  }
}
