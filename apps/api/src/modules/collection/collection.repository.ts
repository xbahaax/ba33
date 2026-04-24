import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_TOKEN } from '../../common/database/database.module';
import type { Database } from '../../common/database/client';
import {
  preLots,
  collectors,
  collectorBooklets,
  routes,
  routeStops,
} from '../../common/database/schema';
import { eq, and, desc } from 'drizzle-orm';

@Injectable()
export class CollectionRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  // ── Pre-Lots ──────────────────────────────────────────────

  async createPreLot(data: typeof preLots.$inferInsert) {
    const [row] = await this.db.insert(preLots).values(data).returning();
    return row;
  }

  async findPreLotById(id: string) {
    const [row] = await this.db
      .select()
      .from(preLots)
      .where(eq(preLots.id, id));
    return row ?? null;
  }

  async findPreLots(filters?: {
    status?: string;
    assignedCollectorId?: string;
    regionId?: string;
  }) {
    const conditions: ReturnType<typeof eq>[] = [];

    if (filters?.status) {
      conditions.push(eq(preLots.status, filters.status as any));
    }
    if (filters?.assignedCollectorId) {
      conditions.push(
        eq(preLots.assignedCollectorId, filters.assignedCollectorId),
      );
    }
    if (filters?.regionId) {
      conditions.push(eq(preLots.regionId, filters.regionId));
    }

    const query = this.db.select().from(preLots);

    if (conditions.length > 0) {
      return query.where(and(...conditions)).orderBy(desc(preLots.createdAt));
    }

    return query.orderBy(desc(preLots.createdAt));
  }

  async updatePreLot(id: string, data: Partial<typeof preLots.$inferInsert>) {
    const [row] = await this.db
      .update(preLots)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(preLots.id, id))
      .returning();
    return row ?? null;
  }

  // ── Collectors ────────────────────────────────────────────

  async createCollector(data: typeof collectors.$inferInsert) {
    const [row] = await this.db.insert(collectors).values(data).returning();
    return row;
  }

  async findCollectorByUserId(userId: string) {
    const [row] = await this.db
      .select()
      .from(collectors)
      .where(eq(collectors.userId, userId));
    return row ?? null;
  }

  // ── Routes ────────────────────────────────────────────────

  async createRoute(data: typeof routes.$inferInsert) {
    const [row] = await this.db.insert(routes).values(data).returning();
    return row;
  }

  async findRouteById(id: string) {
    const [row] = await this.db
      .select()
      .from(routes)
      .where(eq(routes.id, id));
    return row ?? null;
  }

  async findRoutesForCollector(collectorId: string, date?: Date) {
    const conditions: ReturnType<typeof eq>[] = [
      eq(routes.collectorId, collectorId),
    ];

    if (date) {
      conditions.push(eq(routes.date, date));
    }

    return this.db
      .select()
      .from(routes)
      .where(and(...conditions))
      .orderBy(desc(routes.createdAt));
  }

  // ── Route Stops ───────────────────────────────────────────

  async createRouteStop(data: typeof routeStops.$inferInsert) {
    const [row] = await this.db.insert(routeStops).values(data).returning();
    return row;
  }

  async findRouteStops(routeId: string) {
    return this.db
      .select()
      .from(routeStops)
      .where(eq(routeStops.routeId, routeId))
      .orderBy(routeStops.order);
  }

  async updateRouteStop(
    id: string,
    data: Partial<typeof routeStops.$inferInsert>,
  ) {
    const [row] = await this.db
      .update(routeStops)
      .set(data)
      .where(eq(routeStops.id, id))
      .returning();
    return row ?? null;
  }

  // ── Booklets ──────────────────────────────────────────────

  async createBooklet(data: typeof collectorBooklets.$inferInsert) {
    const [row] = await this.db
      .insert(collectorBooklets)
      .values(data)
      .returning();
    return row;
  }

  async findBookletsByCollector(collectorId: string) {
    return this.db
      .select()
      .from(collectorBooklets)
      .where(eq(collectorBooklets.collectorId, collectorId))
      .orderBy(desc(collectorBooklets.issuedAt));
  }
}
