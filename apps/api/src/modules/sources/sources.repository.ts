import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_TOKEN } from '../../common/database/database.module';
import type { Database } from '../../common/database/client';
import {
  sources,
  shepherds,
  slaughterhouses,
  aggregators,
} from '../../common/database/schema';
import { eq, and, desc } from 'drizzle-orm';

@Injectable()
export class SourcesRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async create(data: {
    id?: string;
    sourceType: 'c1_shepherd' | 'c2_slaughterhouse' | 'c3_aggregator';
    name: string;
    contactPhone?: string;
    contactEmail?: string;
    regionId: string;
    latitude?: string;
    longitude?: string;
    address?: string;
    status?: 'pending' | 'active' | 'suspended';
    registeredBy?: string;
    notes?: string;
  }) {
    const [source] = await this.db.insert(sources).values(data).returning();
    return source;
  }

  async findById(id: string) {
    const [source] = await this.db
      .select()
      .from(sources)
      .where(eq(sources.id, id));
    return source ?? null;
  }

  async findAll(filters?: {
    type?: 'c1_shepherd' | 'c2_slaughterhouse' | 'c3_aggregator';
    regionId?: string;
    status?: 'pending' | 'active' | 'suspended';
  }) {
    const conditions = [];

    if (filters?.type) {
      conditions.push(eq(sources.sourceType, filters.type));
    }
    if (filters?.regionId) {
      conditions.push(eq(sources.regionId, filters.regionId));
    }
    if (filters?.status) {
      conditions.push(eq(sources.status, filters.status));
    }

    const query = this.db.select().from(sources);

    if (conditions.length > 0) {
      return query.where(and(...conditions)).orderBy(desc(sources.createdAt));
    }

    return query.orderBy(desc(sources.createdAt));
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      contactPhone: string;
      contactEmail: string;
      regionId: string;
      latitude: string;
      longitude: string;
      address: string;
      status: 'pending' | 'active' | 'suspended';
      notes: string;
    }>,
  ) {
    const [updated] = await this.db
      .update(sources)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(sources.id, id))
      .returning();
    return updated ?? null;
  }

  async createShepherd(
    sourceId: string,
    data: {
      hasSmartphone: boolean;
      preferredLanguage?: string;
      flockSizeEstimate?: number;
      typicalYieldKgPerYear?: string;
    },
  ) {
    const [shepherd] = await this.db
      .insert(shepherds)
      .values({ sourceId, ...data })
      .returning();
    return shepherd;
  }

  async createSlaughterhouse(
    sourceId: string,
    data: {
      licenseNumber: string;
      dailyCapacityHeads?: number;
      hasColdStorage: boolean;
    },
  ) {
    const [slaughterhouse] = await this.db
      .insert(slaughterhouses)
      .values({ sourceId, ...data })
      .returning();
    return slaughterhouse;
  }

  async createAggregator(
    sourceId: string,
    data: {
      businessRegistration: string;
      registeredUpstreamCount?: number;
      premiumCertified?: boolean;
    },
  ) {
    const [aggregator] = await this.db
      .insert(aggregators)
      .values({ sourceId, ...data })
      .returning();
    return aggregator;
  }

  async findShepherdDetails(sourceId: string) {
    const [result] = await this.db
      .select()
      .from(sources)
      .innerJoin(shepherds, eq(sources.id, shepherds.sourceId))
      .where(eq(sources.id, sourceId));
    return result ?? null;
  }

  async findSlaughterhouseDetails(sourceId: string) {
    const [result] = await this.db
      .select()
      .from(sources)
      .innerJoin(slaughterhouses, eq(sources.id, slaughterhouses.sourceId))
      .where(eq(sources.id, sourceId));
    return result ?? null;
  }

  async findAggregatorDetails(sourceId: string) {
    const [result] = await this.db
      .select()
      .from(sources)
      .innerJoin(aggregators, eq(sources.id, aggregators.sourceId))
      .where(eq(sources.id, sourceId));
    return result ?? null;
  }

  async findByRegion(regionId: string) {
    return this.db
      .select()
      .from(sources)
      .where(eq(sources.regionId, regionId))
      .orderBy(desc(sources.createdAt));
  }
}
