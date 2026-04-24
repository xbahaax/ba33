import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_TOKEN } from '../../common/database/database.module';
import type { Database } from '../../common/database/client';
import { syncDevices, syncBatches } from '../../common/database/schema';
import { eq, desc, gt } from 'drizzle-orm';

@Injectable()
export class SyncRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async findDeviceByDeviceId(deviceId: string) {
    const [row] = await this.db
      .select()
      .from(syncDevices)
      .where(eq(syncDevices.deviceId, deviceId))
      .limit(1);
    return row ?? null;
  }

  async registerDevice(data: {
    id: string;
    userId: string;
    deviceId: string;
    deviceInfo: Record<string, unknown>;
    namespacePrefix: string;
  }) {
    const [row] = await this.db
      .insert(syncDevices)
      .values(data)
      .returning();
    return row;
  }

  async findDevicesByUserId(userId: string) {
    return this.db
      .select()
      .from(syncDevices)
      .where(eq(syncDevices.userId, userId))
      .orderBy(desc(syncDevices.createdAt));
  }

  async createBatch(data: {
    id: string;
    deviceId: string;
    direction: 'push' | 'pull';
    eventCount: number;
    status: 'pending' | 'completed' | 'failed';
    startedAt: Date;
  }) {
    const [row] = await this.db
      .insert(syncBatches)
      .values(data)
      .returning();
    return row;
  }

  async updateBatch(
    batchId: string,
    data: {
      status?: 'pending' | 'completed' | 'failed';
      eventCount?: number;
      error?: string;
      completedAt?: Date;
    },
  ) {
    const [row] = await this.db
      .update(syncBatches)
      .set(data)
      .where(eq(syncBatches.id, batchId))
      .returning();
    return row ?? null;
  }

  async updateDeviceLastSync(deviceId: string, timestamp: Date) {
    const [row] = await this.db
      .update(syncDevices)
      .set({ lastSyncAt: timestamp })
      .where(eq(syncDevices.id, deviceId))
      .returning();
    return row ?? null;
  }

  async findBatchesByDevice(deviceId: string) {
    return this.db
      .select()
      .from(syncBatches)
      .where(eq(syncBatches.deviceId, deviceId))
      .orderBy(desc(syncBatches.startedAt));
  }

  async findAllDevices() {
    return this.db
      .select()
      .from(syncDevices)
      .orderBy(desc(syncDevices.createdAt));
  }
}
