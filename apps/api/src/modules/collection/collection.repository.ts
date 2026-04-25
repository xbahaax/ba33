import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_TOKEN } from '../../common/database/database.module';
import type { Database } from '../../common/database/client';
import {
  preLots,
  collectors,
  collectorBooklets,
  routes,
  routeStops,
  sources,
  shepherds,
  users,
  depots,
  collectionJobs,
  collectionJobGpsPoints,
} from '../../common/database/schema';
import { eq, and, desc, lt, inArray, asc, sql, or, isNull } from 'drizzle-orm';

@Injectable()
export class CollectionRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  // ── Users ───────────────────────────────────────────────

  async findUserById(userId: string) {
    const [user] = await this.db
      .select({
        id: users.id,
        regionId: users.regionId,
        fullName: users.fullName,
        userType: users.userType,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    return user ?? null;
  }

  // ── Sources ─────────────────────────────────────────────

  async createSource(data: {
    id: string;
    sourceType: string;
    profession?: string;
    name: string;
    contactPhone?: string;
    regionId: string;
    latitude?: string;
    longitude?: string;
    address?: string;
    status?: string;
    registeredBy?: string;
  }) {
    const [row] = await this.db
      .insert(sources)
      .values({
        id: data.id,
        sourceType: data.sourceType as any,
        profession: data.profession as any,
        name: data.name,
        contactPhone: data.contactPhone,
        regionId: data.regionId,
        latitude: data.latitude,
        longitude: data.longitude,
        address: data.address,
        status: (data.status as any) ?? 'active',
        registeredBy: data.registeredBy,
      })
      .returning();
    return row;
  }

  async updateSource(
    sourceId: string,
    data: {
      profession?: string;
      name?: string;
      contactPhone?: string;
      latitude?: string;
      longitude?: string;
      address?: string;
    },
  ) {
    const setValues: Record<string, any> = { updatedAt: new Date() };
    if (data.profession !== undefined) setValues.profession = data.profession;
    if (data.name !== undefined) setValues.name = data.name;
    if (data.contactPhone !== undefined) setValues.contactPhone = data.contactPhone;
    if (data.latitude !== undefined) setValues.latitude = data.latitude;
    if (data.longitude !== undefined) setValues.longitude = data.longitude;
    if (data.address !== undefined) setValues.address = data.address;

    const [row] = await this.db
      .update(sources)
      .set(setValues)
      .where(eq(sources.id, sourceId))
      .returning();
    return row ?? null;
  }

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
      .where(eq(sources.registeredBy, userId))
      .limit(1);
    return source ?? null;
  }

  // ── Shepherd Details ────────────────────────────────────

  async createShepherdDetails(
    sourceId: string,
    details: { hasSmartphone: boolean; preferredLanguage?: string },
  ) {
    const [row] = await this.db
      .insert(shepherds)
      .values({
        sourceId,
        hasSmartphone: details.hasSmartphone,
        preferredLanguage: details.preferredLanguage,
      })
      .returning();
    return row;
  }

  // ── Pre-Lots ────────────────────────────────────────────

  async createPreLot(data: {
    id: string;
    sourceId: string;
    estimatedWeightKg: string;
    estimatedRange?: string;
    locationLat?: string;
    locationLng?: string;
    regionId?: string;
    notes?: string;
    voiceNoteId?: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    const [row] = await this.db
      .insert(preLots)
      .values({
        id: data.id,
        sourceId: data.sourceId,
        estimatedWeightKg: data.estimatedWeightKg,
        estimatedRange: data.estimatedRange,
        locationLat: data.locationLat,
        locationLng: data.locationLng,
        regionId: data.regionId,
        notes: data.notes,
        voiceNoteId: data.voiceNoteId,
        status: data.status as any,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      })
      .returning();
    return row;
  }

  async findPreLotById(id: string) {
    const [preLot] = await this.db
      .select()
      .from(preLots)
      .where(eq(preLots.id, id))
      .limit(1);
    return preLot ?? null;
  }

  async findPreLots(filters?: {
    status?: string;
    assignedCollectorId?: string;
    regionId?: string;
    registeredBy?: string;
  }) {
    const conditions = [];
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
    if (filters?.registeredBy) {
      const sourceRows = await this.db
        .select({ id: sources.id })
        .from(sources)
        .where(eq(sources.registeredBy, filters.registeredBy));

      if (sourceRows.length === 0) {
        return [];
      }

      conditions.push(inArray(preLots.sourceId, sourceRows.map((source) => source.id)));
    }

    return this.db
      .select()
      .from(preLots)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(preLots.createdAt));
  }

  async updatePreLot(
    id: string,
    data: {
      status?: string;
      assignedCollectorId?: string;
      scheduledAt?: Date;
      lotId?: string;
    },
  ) {
    const setValues: Record<string, any> = { updatedAt: new Date() };
    if (data.status !== undefined) setValues.status = data.status;
    if (data.assignedCollectorId !== undefined)
      setValues.assignedCollectorId = data.assignedCollectorId;
    if (data.scheduledAt !== undefined) setValues.scheduledAt = data.scheduledAt;
    if (data.lotId !== undefined) setValues.lotId = data.lotId;

    const [row] = await this.db
      .update(preLots)
      .set(setValues)
      .where(eq(preLots.id, id))
      .returning();
    return row ?? null;
  }

  async findStalePreLots(cutoff: Date) {
    return this.db
      .select()
      .from(preLots)
      .where(
        and(
          inArray(preLots.status, ['announced', 'assigned'] as any),
          lt(preLots.createdAt, cutoff),
        ),
      );
  }

  // ── Depots ──────────────────────────────────────────────

  async findDepotById(depotId: string) {
    const [depot] = await this.db
      .select({
        id: depots.id,
        name: depots.name,
        regionId: depots.regionId,
        address: depots.address,
      })
      .from(depots)
      .where(eq(depots.id, depotId))
      .limit(1);
    return depot ?? null;
  }

  async findClosestDepot(
    regionId: string,
    _sourceLat?: string,
    _sourceLng?: string,
  ) {
    // Find an active depot in the same region
    const [depot] = await this.db
      .select({
        id: depots.id,
        name: depots.name,
        regionId: depots.regionId,
      })
      .from(depots)
      .where(and(eq(depots.active, true), eq(depots.regionId, regionId)))
      .limit(1);

    if (depot) return depot;

    // Fallback: any active depot
    const [anyDepot] = await this.db
      .select({
        id: depots.id,
        name: depots.name,
        regionId: depots.regionId,
      })
      .from(depots)
      .where(eq(depots.active, true))
      .limit(1);

    return anyDepot ?? null;
  }

  // ── Collectors ──────────────────────────────────────────

  async createCollector(data: {
    userId: string;
    assignedRegions: string[];
    certifications?: unknown;
    active: boolean;
  }) {
    const [row] = await this.db
      .insert(collectors)
      .values({
        userId: data.userId,
        assignedRegions: data.assignedRegions,
        certifications: data.certifications,
        active: data.active,
      })
      .returning();
    return row;
  }

  async findCollectorByUserId(userId: string) {
    const [collector] = await this.db
      .select({
        userId: collectors.userId,
        assignedRegions: collectors.assignedRegions,
        certifications: collectors.certifications,
        active: collectors.active,
        fullName: users.fullName,
        phone: users.phone,
        regionId: users.regionId,
      })
      .from(collectors)
      .leftJoin(users, eq(collectors.userId, users.id))
      .where(eq(collectors.userId, userId))
      .limit(1);
    return collector ?? null;
  }

  // ── Routes ──────────────────────────────────────────────

  async createRoute(data: {
    id: string;
    collectorId: string;
    date: Date;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    const [row] = await this.db
      .insert(routes)
      .values({
        id: data.id,
        collectorId: data.collectorId,
        date: data.date,
        status: data.status as any,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      })
      .returning();
    return row;
  }

  async findRouteById(id: string) {
    const [route] = await this.db
      .select()
      .from(routes)
      .where(eq(routes.id, id))
      .limit(1);
    return route ?? null;
  }

  async findRouteStops(routeId: string) {
    return this.db
      .select()
      .from(routeStops)
      .where(eq(routeStops.routeId, routeId))
      .orderBy(asc(routeStops.order));
  }

  async findRoutesForCollector(collectorId: string, date?: Date) {
    const conditions = [eq(routes.collectorId, collectorId)];
    if (date) {
      // Match routes on the same day
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      conditions.push(sql`${routes.date} >= ${dayStart}` as any);
      conditions.push(sql`${routes.date} <= ${dayEnd}` as any);
    }

    return this.db
      .select()
      .from(routes)
      .where(and(...conditions))
      .orderBy(desc(routes.date));
  }

  async updateRouteStop(
    stopId: string,
    data: { status?: string; arrivalTime?: Date },
  ) {
    const setValues: Record<string, any> = {};
    if (data.status !== undefined) setValues.status = data.status;
    if (data.arrivalTime !== undefined) setValues.arrivalTime = data.arrivalTime;

    const [row] = await this.db
      .update(routeStops)
      .set(setValues)
      .where(eq(routeStops.id, stopId))
      .returning();
    return row ?? null;
  }

  // ── Booklets ────────────────────────────────────────────

  async createBooklet(data: {
    id: string;
    collectorId: string;
    serialStart: string;
    serialEnd: string;
    issuedAt: Date;
  }) {
    const [row] = await this.db
      .insert(collectorBooklets)
      .values({
        id: data.id,
        collectorId: data.collectorId,
        serialStart: data.serialStart,
        serialEnd: data.serialEnd,
        issuedAt: data.issuedAt,
      })
      .returning();
    return row;
  }

  // ── Collection Jobs ─────────────────────────────────────

  async createCollectionJob(data: {
    id: string;
    preLotId: string;
    sourceId: string;
    destinationDepotId: string;
    collectorId?: string;
    urgency: 'normal' | 'urgent';
    status: string;
    originLat?: string;
    originLng?: string;
    destinationLat?: string;
    destinationLng?: string;
    slaDeadline?: Date;
    notes?: string;
    issuedBy?: string;
  }) {
    const [row] = await this.db
      .insert(collectionJobs)
      .values({
        id: data.id,
        preLotId: data.preLotId,
        sourceId: data.sourceId,
        destinationDepotId: data.destinationDepotId,
        collectorId: data.collectorId,
        urgency: data.urgency,
        status: data.status as any,
        originLat: data.originLat,
        originLng: data.originLng,
        destinationLat: data.destinationLat,
        destinationLng: data.destinationLng,
        slaDeadline: data.slaDeadline,
        notes: data.notes,
        issuedBy: data.issuedBy,
        assignedAt: data.collectorId ? new Date() : null,
      })
      .returning();
    return row;
  }

  async findCollectionJobById(jobId: string) {
    const [row] = await this.db
      .select()
      .from(collectionJobs)
      .where(eq(collectionJobs.id, jobId))
      .limit(1);
    return row ?? null;
  }

  async findCollectionJobs(filters?: {
    status?: string | string[];
    collectorId?: string;
    depotId?: string;
    sourceId?: string;
    includeUnassignedOpen?: boolean;
  }) {
    const conditions = [];
    if (filters?.status) {
      if (Array.isArray(filters.status)) {
        conditions.push(inArray(collectionJobs.status, filters.status as any));
      } else {
        conditions.push(eq(collectionJobs.status, filters.status as any));
      }
    }
    if (filters?.collectorId) {
      conditions.push(
        filters.includeUnassignedOpen
          ? or(
              eq(collectionJobs.collectorId, filters.collectorId),
              and(
                isNull(collectionJobs.collectorId),
                inArray(collectionJobs.status, ['pending', 'assigned'] as any),
              ),
            )
          : eq(collectionJobs.collectorId, filters.collectorId),
      );
    }
    if (filters?.depotId) {
      conditions.push(eq(collectionJobs.destinationDepotId, filters.depotId));
    }
    if (filters?.sourceId) {
      conditions.push(eq(collectionJobs.sourceId, filters.sourceId));
    }

    return this.db
      .select()
      .from(collectionJobs)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(collectionJobs.createdAt));
  }

  async updateCollectionJob(
    jobId: string,
    data: {
      status?: string;
      collectorId?: string;
      assignedAt?: Date;
      acceptedAt?: Date;
      startedAt?: Date;
      arrivedAt?: Date;
      completedAt?: Date;
      cancelledAt?: Date;
      cancelReason?: string;
      lotId?: string;
      urgency?: string;
      notes?: string;
    },
  ) {
    const setValues: Record<string, any> = { updatedAt: new Date() };
    for (const [k, v] of Object.entries(data)) {
      if (v !== undefined) setValues[k] = v;
    }
    const [row] = await this.db
      .update(collectionJobs)
      .set(setValues)
      .where(eq(collectionJobs.id, jobId))
      .returning();
    return row ?? null;
  }

  async addCollectionJobGps(
    jobId: string,
    points: Array<{
      lat: string;
      lng: string;
      speedMps?: string;
      accuracy?: string;
      recordedAt: Date;
    }>,
  ) {
    if (points.length === 0) return [];
    return this.db
      .insert(collectionJobGpsPoints)
      .values(points.map((p) => ({ jobId, ...p })))
      .returning();
  }

  async findCollectionJobGps(jobId: string) {
    return this.db
      .select()
      .from(collectionJobGpsPoints)
      .where(eq(collectionJobGpsPoints.jobId, jobId))
      .orderBy(asc(collectionJobGpsPoints.recordedAt));
  }
}
