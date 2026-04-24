import { Injectable, Logger } from '@nestjs/common';
import { EventsRepository } from './events.repository';
import * as crypto from 'crypto';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(private readonly eventsRepository: EventsRepository) {}

  getRecent() {
    return this.eventsRepository.getRecent();
  }

  async emit(data: {
    eventType: string;
    aggregateType: string;
    aggregateId: string;
    actorId?: string;
    actorType: string;
    payload?: unknown;
    occurredAt: Date;
    version: number;
    syncSource?: string;
    deviceId?: string;
  }) {
    const checksum = crypto
      .createHash('sha256')
      .update(
        `${data.eventType}:${data.aggregateId}:${data.occurredAt.toISOString()}:${data.version}`,
      )
      .digest('hex')
      .slice(0, 16);

    try {
      return await this.eventsRepository.create({
        eventType: data.eventType,
        aggregateType: data.aggregateType,
        aggregateId: data.aggregateId,
        actorId: data.actorId,
        actorType: data.actorType,
        payload: data.payload ?? {},
        occurredAt: data.occurredAt,
        version: data.version,
        syncSource: data.syncSource,
        deviceId: data.deviceId,
        checksum,
      });
    } catch (e: any) {
      // Duplicate checksum — silently skip
      if (e?.code === '23505') {
        this.logger.debug(`Duplicate event skipped: ${data.eventType} ${data.aggregateId}`);
        return null;
      }
      throw e;
    }
  }

  async getEntityHistory(aggregateType: string, aggregateId: string) {
    return this.eventsRepository.findByAggregate(aggregateType, aggregateId);
  }

  async getEventsSince(recordedAt: Date) {
    return this.eventsRepository.findSince(recordedAt);
  }
}
