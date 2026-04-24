import { Injectable, NotFoundException } from '@nestjs/common';
import { LotsRepository } from './lots.repository';
import { EventsService } from '../events/events.service';
import { v4 as uuid } from 'uuid';

@Injectable()
export class LotsService {
  constructor(
    private readonly lotsRepository: LotsRepository,
    private readonly eventsService: EventsService,
  ) {}

  async createLot(
    data: {
      sourceId: string;
      sourceType?: 'c1_shepherd' | 'c2_slaughterhouse' | 'c3_aggregator';
      collectorId?: string;
      qrCode: string;
      declaredWeightKg?: string;
      stateQuick?: 'clean' | 'dirty' | 'very_dirty' | 'contaminated' | 'with_meat';
      urgency?: 'normal' | 'urgent';
      coldChainTempC?: string;
      gpsLat?: string;
      gpsLng?: string;
      isUrgent?: boolean;
      preLotId?: string;
      routeStopId?: string;
      notes?: string;
      voiceNoteId?: string;
      initialWeigh?: {
        weightKg: string;
        source?: 'scale_bluetooth' | 'manual' | 'estimated';
      };
    },
    actorId: string,
  ) {
    const lotId = uuid();

    const lot = await this.lotsRepository.create({
      id: lotId,
      sourceId: data.sourceId,
      sourceType: data.sourceType,
      collectorId: data.collectorId ?? actorId,
      qrCode: data.qrCode,
      declaredWeightKg: data.declaredWeightKg,
      stateQuick: data.stateQuick,
      urgency: data.urgency,
      coldChainTempC: data.coldChainTempC,
      gpsLat: data.gpsLat,
      gpsLng: data.gpsLng,
      status: 'collected',
      isUrgent: data.isUrgent ?? false,
      collectedAt: new Date(),
      preLotId: data.preLotId,
      routeStopId: data.routeStopId,
      notes: data.notes,
      voiceNoteId: data.voiceNoteId,
    });

    // Emit lot.collected event
    const now = new Date();
    const event = await this.eventsService.emit({
      eventType: 'lot.collected',
      aggregateType: 'lot',
      aggregateId: lotId,
      actorId,
      actorType: 'collector',
      payload: { sourceId: data.sourceId, sourceType: data.sourceType, qrCode: data.qrCode },
      occurredAt: now,
      version: 1,
    });

    // Add initial weigh record if provided
    if (data.initialWeigh) {
      await this.lotsRepository.addWeigh({
        lotId,
        phase: 'collection',
        weightKg: data.initialWeigh.weightKg,
        source: data.initialWeigh.source,
        recordedBy: actorId,
        recordedAt: now,
        eventId: event.id,
      });
    }

    return lot;
  }

  async getLot(id: string) {
    const lot = await this.lotsRepository.findById(id);
    if (!lot) {
      throw new NotFoundException(`Lot ${id} not found`);
    }

    const [photos, signatures, weighs] = await Promise.all([
      this.lotsRepository.getPhotos(id),
      this.lotsRepository.getSignatures(id),
      this.lotsRepository.getWeighs(id),
    ]);

    return {
      ...lot,
      photos,
      signatures,
      weighs,
    };
  }

  async listLots(filters?: {
    collectorId?: string;
    sourceType?: 'c1_shepherd' | 'c2_slaughterhouse' | 'c3_aggregator';
    status?: string;
    isUrgent?: boolean;
  }) {
    return this.lotsRepository.findAll(filters);
  }

  async updateLotStatus(id: string, newStatus: string, actorId: string) {
    const lot = await this.lotsRepository.findById(id);
    if (!lot) {
      throw new NotFoundException(`Lot ${id} not found`);
    }

    const updated = await this.lotsRepository.update(id, { status: newStatus });

    // Emit status change event
    const now = new Date();
    await this.eventsService.emit({
      eventType: `lot.${newStatus}`,
      aggregateType: 'lot',
      aggregateId: id,
      actorId,
      actorType: 'user',
      payload: { previousStatus: lot.status, newStatus },
      occurredAt: now,
      version: 1,
    });

    return updated;
  }

  async lookupByQr(qrCode: string) {
    const lot = await this.lotsRepository.findByQrCode(qrCode);
    if (!lot) {
      throw new NotFoundException(`Lot with QR code ${qrCode} not found`);
    }
    return lot;
  }

  async addPhoto(
    lotId: string,
    fileId: string,
    angle?: 'overview' | 'closeup' | 'surroundings' | 'other',
    gpsLat?: string,
    gpsLng?: string,
  ) {
    const lot = await this.lotsRepository.findById(lotId);
    if (!lot) {
      throw new NotFoundException(`Lot ${lotId} not found`);
    }

    return this.lotsRepository.addPhoto({
      lotId,
      fileId,
      angle,
      capturedAt: new Date(),
      gpsLat,
      gpsLng,
    });
  }

  async addSignature(
    lotId: string,
    type: 'digital' | 'thumbprint' | 'paper_photo',
    fileId: string,
    signedByName?: string,
  ) {
    const lot = await this.lotsRepository.findById(lotId);
    if (!lot) {
      throw new NotFoundException(`Lot ${lotId} not found`);
    }

    return this.lotsRepository.addSignature({
      lotId,
      type,
      fileId,
      signedByName,
      capturedAt: new Date(),
    });
  }
}
