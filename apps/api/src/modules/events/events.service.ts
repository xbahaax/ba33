import { Injectable } from '@nestjs/common';
import { EventsRepository } from './events.repository';
import { v4 as uuid } from 'uuid';
import { createHash } from 'crypto';

@Injectable()
export class EventsService {
  constructor(private readonly eventsRepository: EventsRepository) {}

  private computeChecksum(
    eventType: string,
    aggregateId: string,
    occurredAt: Date,
  ): string {
    const input = `${eventType}:${aggregateId}:${occurredAt.toISOString()}`;
    return createHash('sha256').update(input).digest('hex');
  }

  async emit(data: {
    eventType: string;
    aggregateType: string;
    aggregateId: string;
    actorId?: string;
    actorType: string;
    payload?: unknown;
    occurredAt: Date;
    syncSource?: string;
    deviceId?: string;
    version: number;
  }) {
    const id = uuid();
    const recordedAt = new Date();
    const checksum = this.computeChecksum(
      data.eventType,
      data.aggregateId,
      data.occurredAt,
    );

    return this.eventsRepository.create({
      id,
      ...data,
      recordedAt,
      checksum,
    });
  }

  async getEntityHistory(aggregateType: string, aggregateId: string) {
    return this.eventsRepository.findByAggregate(aggregateType, aggregateId);
  }

  async getEventsByType(eventType: string, from?: Date, to?: Date) {
    return this.eventsRepository.findByType(eventType, from, to);
  }

  async getEventsSince(recordedAt: Date) {
    return this.eventsRepository.findSince(recordedAt);
  }
}
