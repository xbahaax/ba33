import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { SyncRepository } from './sync.repository';
import { EventsService } from '../events/events.service';
import { v4 as uuid } from 'uuid';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    private readonly syncRepository: SyncRepository,
    private readonly eventsService: EventsService,
  ) {}

  // ── Device Registration ─────────────────────────────────

  async registerDevice(
    userId: string,
    deviceId: string,
    deviceInfo: Record<string, unknown>,
  ) {
    // Check if device already registered
    const existing = await this.syncRepository.findDeviceByDeviceId(deviceId);
    if (existing) {
      return existing;
    }

    // Generate namespace prefix from userId to prevent ID collisions
    const namespacePrefix = `${userId.slice(0, 8)}-${deviceId.slice(0, 8)}`;

    const device = await this.syncRepository.registerDevice({
      id: uuid(),
      userId,
      deviceId,
      deviceInfo,
      namespacePrefix,
    });

    this.logger.log(`Device registered: ${deviceId} for user ${userId}, namespace: ${namespacePrefix}`);
    return device;
  }

  async getDevice(deviceId: string) {
    const device = await this.syncRepository.findDeviceByDeviceId(deviceId);
    if (!device) {
      throw new NotFoundException(`Device ${deviceId} not registered`);
    }
    return device;
  }

  async getUserDevices(userId: string) {
    return this.syncRepository.findDevicesByUserId(userId);
  }

  // ── Push (device → server) ──────────────────────────────

  async pushEvents(
    deviceId: string,
    events: Array<{
      eventType: string;
      aggregateType: string;
      aggregateId: string;
      actorId?: string;
      actorType: string;
      payload?: unknown;
      occurredAt: string;
      version: number;
      deviceId?: string;
    }>,
  ) {
    const device = await this.getDevice(deviceId);

    if (events.length === 0) {
      return { batchId: null, processed: 0, skipped: 0 };
    }

    const batchId = uuid();
    const batch = await this.syncRepository.createBatch({
      id: batchId,
      deviceId: device.id,
      direction: 'push',
      eventCount: events.length,
      status: 'pending',
      startedAt: new Date(),
    });

    let processed = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const event of events) {
      try {
        await this.eventsService.emit({
          eventType: event.eventType,
          aggregateType: event.aggregateType,
          aggregateId: event.aggregateId,
          actorId: event.actorId,
          actorType: event.actorType,
          payload: event.payload,
          occurredAt: new Date(event.occurredAt),
          syncSource: 'device',
          deviceId,
          version: event.version,
        });
        processed++;
      } catch (err: any) {
        // Duplicate events (same checksum) are expected — skip silently
        if (err?.code === '23505') {
          skipped++;
        } else {
          errors.push(`${event.eventType}/${event.aggregateId}: ${err.message}`);
        }
      }
    }

    const status = errors.length > 0 ? 'failed' : 'completed';
    await this.syncRepository.updateBatch(batchId, {
      status,
      eventCount: processed,
      error: errors.length > 0 ? errors.join('; ') : undefined,
      completedAt: new Date(),
    });

    // Update device last sync time
    await this.syncRepository.updateDeviceLastSync(device.id, new Date());

    this.logger.log(
      `Push sync from ${deviceId}: ${processed} processed, ${skipped} skipped, ${errors.length} errors`,
    );

    return { batchId, processed, skipped, errors: errors.length > 0 ? errors : undefined };
  }

  // ── Pull (server → device) ──────────────────────────────

  async pullEvents(deviceId: string, since?: string) {
    const device = await this.getDevice(deviceId);

    // Determine the cursor: use provided timestamp, or device's last sync, or epoch
    const sinceDate = since
      ? new Date(since)
      : device.lastSyncAt
        ? new Date(device.lastSyncAt)
        : new Date(0);

    const events = await this.eventsService.getEventsSince(sinceDate);

    const batchId = uuid();
    await this.syncRepository.createBatch({
      id: batchId,
      deviceId: device.id,
      direction: 'pull',
      eventCount: events.length,
      status: 'completed',
      startedAt: new Date(),
    });

    // Update device last sync time
    await this.syncRepository.updateDeviceLastSync(device.id, new Date());

    this.logger.log(
      `Pull sync for ${deviceId}: ${events.length} events since ${sinceDate.toISOString()}`,
    );

    return {
      batchId,
      eventCount: events.length,
      since: sinceDate.toISOString(),
      events,
    };
  }

  // ── Sync Status ─────────────────────────────────────────

  async getSyncHistory(deviceId: string) {
    const device = await this.getDevice(deviceId);
    const batches = await this.syncRepository.findBatchesByDevice(device.id);
    return {
      device,
      batches,
    };
  }

  // ── 48h No-Sync Alert Check ─────────────────────────────

  async checkStaleDevices(maxHours = 48) {
    // This would be called by a cron job
    const allDevices = await this.syncRepository.findDevicesByUserId(''); // needs a findAll method
    const cutoff = new Date(Date.now() - maxHours * 60 * 60 * 1000);
    const stale: string[] = [];

    // For now, this is a placeholder — would need a findAllDevices repo method
    // and would notify central operations about stale collectors
    return { staleDevices: stale, cutoffHours: maxHours };
  }
}
