import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_TOKEN } from '../../common/database/database.module';
import type { Database } from '../../common/database/client';
import {
  depots,
  depotZones,
  depotReceptions,
  depotDispatches,
  depotDispatchLots,
  a1Alerts,
  lots,
} from '../../common/database/schema';
import { eq, and, desc, isNull, count } from 'drizzle-orm';

@Injectable()
export class DepotRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async createDepot(data: {
    id: string;
    name: string;
    regionId: string;
    address: string;
    capacityKg: string;
    currentWeightKg: string;
    managerId?: string;
    active?: boolean;
  }) {
    const [depot] = await this.db.insert(depots).values(data).returning();
    return depot;
  }

  async findDepotById(id: string) {
    const [depot] = await this.db
      .select()
      .from(depots)
      .where(eq(depots.id, id))
      .limit(1);
    return depot ?? null;
  }

  async findAllDepots() {
    return this.db.select().from(depots).orderBy(desc(depots.createdAt));
  }

  async updateDepot(
    id: string,
    data: Partial<{
      name: string;
      address: string;
      capacityKg: string;
      currentWeightKg: string;
      managerId: string;
      active: boolean;
      updatedAt: Date;
    }>,
  ) {
    const [depot] = await this.db
      .update(depots)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(depots.id, id))
      .returning();
    return depot;
  }

  async createZone(data: {
    id: string;
    depotId: string;
    code: string;
    purpose: 'c1_normal' | 'c2_urgent' | 'c3_aggregator' | 'quarantine' | 'dispatch_ready';
    capacityKg: string;
    currentWeightKg: string;
  }) {
    const [zone] = await this.db.insert(depotZones).values(data).returning();
    return zone;
  }

  async findZones(depotId: string) {
    return this.db
      .select()
      .from(depotZones)
      .where(eq(depotZones.depotId, depotId));
  }

  async createReception(data: {
    id: string;
    depotId: string;
    lotId: string;
    declaredWeightKg: string;
    actualWeightKg: string;
    discrepancyKg: string;
    toleranceExceeded: boolean;
    zoneId?: string;
    receivedBy: string;
    receivedAt: Date;
    notes?: string;
  }) {
    const [reception] = await this.db
      .insert(depotReceptions)
      .values(data)
      .returning();
    return reception;
  }

  async findReceptions(depotId: string, lotId?: string) {
    const conditions = [eq(depotReceptions.depotId, depotId)];
    if (lotId) {
      conditions.push(eq(depotReceptions.lotId, lotId));
    }
    return this.db
      .select()
      .from(depotReceptions)
      .where(and(...conditions))
      .orderBy(desc(depotReceptions.receivedAt));
  }

  async countUrgentLots(depotId: string): Promise<number> {
    const [result] = await this.db
      .select({ count: count() })
      .from(depotReceptions)
      .innerJoin(lots, eq(depotReceptions.lotId, lots.id))
      .where(
        and(
          eq(depotReceptions.depotId, depotId),
          eq(lots.isUrgent, true),
          eq(lots.status, 'received_depot'),
        ),
      );
    return result?.count ?? 0;
  }

  async createDispatch(data: {
    id: string;
    depotId: string;
    destinationLaverieId: string;
    manifestWeightKg: string;
    dispatchedBy: string;
    dispatchedAt: Date;
    transportJobId?: string;
  }) {
    const [dispatch] = await this.db
      .insert(depotDispatches)
      .values(data)
      .returning();
    return dispatch;
  }

  async addDispatchLot(dispatchId: string, lotId: string, weightKg: string) {
    const [dispatchLot] = await this.db
      .insert(depotDispatchLots)
      .values({ dispatchId, lotId, weightKg })
      .returning();
    return dispatchLot;
  }

  async findDispatches(depotId: string) {
    return this.db
      .select()
      .from(depotDispatches)
      .where(eq(depotDispatches.depotId, depotId))
      .orderBy(desc(depotDispatches.dispatchedAt));
  }

  async createA1Alert(data: {
    id: string;
    depotId: string;
    triggerCondition: unknown;
    severity: 'info' | 'warning' | 'critical';
    status: 'open' | 'acknowledged' | 'resolved';
    firedAt: Date;
    resolvedAt?: Date;
  }) {
    const [alert] = await this.db.insert(a1Alerts).values(data).returning();
    return alert;
  }

  async findActiveAlerts(depotId?: string) {
    const conditions = [eq(a1Alerts.status, 'open')];
    if (depotId) {
      conditions.push(eq(a1Alerts.depotId, depotId));
    }
    return this.db
      .select()
      .from(a1Alerts)
      .where(and(...conditions))
      .orderBy(desc(a1Alerts.firedAt));
  }

  async updateAlert(
    id: string,
    data: Partial<{
      status: 'open' | 'acknowledged' | 'resolved';
      resolvedAt: Date;
    }>,
  ) {
    const [alert] = await this.db
      .update(a1Alerts)
      .set(data)
      .where(eq(a1Alerts.id, id))
      .returning();
    return alert;
  }
}
