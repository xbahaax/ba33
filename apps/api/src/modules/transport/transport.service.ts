import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { TransportRepository } from './transport.repository';
import { EventsService } from '../events/events.service';
import { v4 as uuid } from 'uuid';

@Injectable()
export class TransportService {
  constructor(
    private readonly transportRepository: TransportRepository,
    private readonly eventsService: EventsService,
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
    const job = await this.transportRepository.createJob({
      id: uuid(),
      ...data,
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
      payload: { lane: data.lane },
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

    const updated = await this.transportRepository.updateJob(jobId, {
      status: 'delivered',
      completedAt: new Date(),
    });

    await this.eventsService.emit({
      eventType: 'transport.job.completed',
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

  // ── GPS ───────────────────────────────────────────────────

  async addGpsPoint(
    jobId: string,
    lat: string,
    lng: string,
    temperatureC?: string,
  ) {
    return this.transportRepository.addGpsPoint({
      id: uuid(),
      jobId,
      lat,
      lng,
      temperatureC: temperatureC ?? null,
      recordedAt: new Date(),
    });
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
