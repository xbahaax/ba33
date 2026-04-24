import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_TOKEN } from '../../common/database/database.module';
import type { Database } from '../../common/database/client';
import { syncDevices, syncBatches } from '../../common/database/schema';
import { eq, desc, gt } from 'drizzle-orm';

@Injectable()
export class SyncRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  // ── Devices ─────────────────────────────────────────────

  async registerDevice(data: {
    id: string;
    userId: string;
    deviceId: string;
    deviceInfo: unknown;
    namespacePrefix: string;
  }) {
    const [device] = await this.db
      .insert(syncDevices)
      .values(data)
      .returning();
    return device;
  }

  async findDeviceByDeviceId(deviceId: string) {
    const [device] = await this.db
      .select()
      .from(syncDevices)
      .where(eq(syncDevices.deviceId, deviceId))
      .limit(1);
    return device ?? null;
  }

  async findDevicesByUserId(userId: string) {
    return this.db
      .select()
      .from(syncDevices)
      .where(eq(syncDevices.userId, userId));
  }

  async updateDeviceLastSync(id: string, lastSyncAt: Date) {
    const [device] = await this.db
      .update(syncDevices)
      .set({ lastSyncAt })
      .where(eq(syncDevices.id, id))
      .returning();
    return device;
  }

  // ── Batches ─────────────────────────────────────────────

  async createBatch(data: {
    id: string;
    deviceId: string;
    direction: 'push' | 'pull';
    eventCount: number;
    status?: 'pending' | 'completed' | 'failed';
    startedAt: Date;
  }) {
    const [batch] = await this.db
      .insert(syncBatches)
      .values(data)
      .returning();
    return batch;
  }

  async updateBatch(
    id: string,
    data: Partial<{
      status: string;
      eventCount: number;
      error: string;
      completedAt: Date;
    }>,
  ) {
    const [batch] = await this.db
      .update(syncBatches)
      .set(data as any)
      .where(eq(syncBatches.id, id))
      .returning();
    return batch;
  }

  async findBatchesByDevice(deviceId: string) {
    return this.db
      .select()
      .from(syncBatches)
      .where(eq(syncBatches.deviceId, deviceId))
      .orderBy(desc(syncBatches.startedAt));
  }
}
