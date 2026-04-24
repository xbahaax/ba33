import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { TransportRepository } from './transport.repository';
import { EventsService } from '../events/events.service';
import { RulesService } from '../rules/rules.service';
import { NotificationsService } from '../notifications/notifications.service';
import { LotsService } from '../lots/lots.service';
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
    return this.transportRepository.findJobs(filters);
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
}
