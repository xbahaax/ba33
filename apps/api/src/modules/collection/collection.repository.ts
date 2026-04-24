import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_TOKEN } from '../../common/database/database.module';
import type { Database } from '../../common/database/client';

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

  async findStalePreLots(olderThan: Date) {
    return this.db
      .select()
      .from(preLots)
      .where(
        and(
          inArray(preLots.status, ['announced', 'assigned'] as any),
          lt(preLots.createdAt, olderThan),
        ),
      );
  }

  // ── Sources ──────────────────────────────────────────────

  async findSourceById(sourceId: string) {
    const [source] = await this.db
      .select()
      .from(sources)
      .where(eq(sources.id, sourceId))
      .limit(1);
    return source ?? null;
  }

  async findSourceByRegisteredBy(userId: string) {
    const [source] = await this.db
      .select()
      .from(sources)
      .where(
        and(
          eq(sources.registeredBy, userId),
          eq(sources.sourceType, 'c1_shepherd'),
        ),
      )
      .limit(1);
    return source ?? null;
  }

  async createSource(data: {
    id: string;
    sourceType: 'c1_shepherd' | 'c2_slaughterhouse' | 'c3_aggregator';
    name: string;
    regionId: string;
    latitude?: string;
    longitude?: string;
    address?: string;
    status?: string;
    registeredBy?: string;
  }) {
    const [source] = await this.db
      .insert(sources)
      .values(data as any)
      .returning();
    return source;
  }

  async createShepherdDetails(
    sourceId: string,
    details: {
      hasSmartphone: boolean;
      preferredLanguage?: string;
      flockSizeEstimate?: number;
      typicalYieldKgPerYear?: string;
    },
  ) {
    const [shepherd] = await this.db
      .insert(shepherds)
      .values({ sourceId, ...details })
      .returning();
    return shepherd;
  }

  async findUserById(userId: string) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    return user ?? null;
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

  async findClosestDepot(regionId: string, _lat?: string, _lng?: string) {
    // Match by region (geo-distance can be added once depots have lat/lng)
    const [row] = await this.db
      .select()
      .from(depots)
      .where(and(eq(depots.regionId, regionId), eq(depots.active, true)))
      .limit(1);
    return row ?? null;
  }
}
