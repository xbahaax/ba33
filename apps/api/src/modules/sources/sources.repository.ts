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

  async create(data: typeof sources.$inferInsert) {
    const [row] = await this.db.insert(sources).values(data).returning();
    return row;
  }

  async findById(id: string) {
    const [row] = await this.db
      .select()
      .from(sources)
      .where(eq(sources.id, id))
      .limit(1);
    return row ?? null;
  }

  async findAll(filters?: {
    type?: string;
    regionId?: string;
    status?: string;
  }) {
    let query = this.db.select().from(sources).orderBy(desc(sources.createdAt));
    const conditions: any[] = [];
    if (filters?.type) conditions.push(eq(sources.sourceType, filters.type as any));
    if (filters?.regionId) conditions.push(eq(sources.regionId, filters.regionId));
    if (filters?.status) conditions.push(eq(sources.status, filters.status as any));
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    return query;
  }

  async update(id: string, data: Partial<typeof sources.$inferInsert>) {
    const [row] = await this.db
      .update(sources)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(sources.id, id))
      .returning();
    return row;
  }

  async createShepherd(
    sourceId: string,
    details: {
      hasSmartphone: boolean;
      preferredLanguage?: string;
      flockSizeEstimate?: number;
      typicalYieldKgPerYear?: string;
    },
  ) {
    const [row] = await this.db
      .insert(shepherds)
      .values({ sourceId, ...details })
      .onConflictDoNothing()
      .returning();
    return row;
  }

  async findShepherdDetails(sourceId: string) {
    const [row] = await this.db
      .select()
      .from(shepherds)
      .where(eq(shepherds.sourceId, sourceId))
      .limit(1);
    return row ?? null;
  }

  async createSlaughterhouse(
    sourceId: string,
    details: {
      licenseNumber: string;
      dailyCapacityHeads?: number;
      hasColdStorage: boolean;
    },
  ) {
    const [row] = await this.db
      .insert(slaughterhouses)
      .values({ sourceId, ...details })
      .onConflictDoNothing()
      .returning();
    return row;
  }

  async findSlaughterhouseDetails(sourceId: string) {
    const [row] = await this.db
      .select()
      .from(slaughterhouses)
      .where(eq(slaughterhouses.sourceId, sourceId))
      .limit(1);
    return row ?? null;
  }

  async createAggregator(
    sourceId: string,
    details: {
      businessRegistration: string;
      registeredUpstreamCount?: number;
      premiumCertified?: boolean;
    },
  ) {
    const [row] = await this.db
      .insert(aggregators)
      .values({ sourceId, ...details })
      .onConflictDoNothing()
      .returning();
    return row;
  }

  async findAggregatorDetails(sourceId: string) {
    const [row] = await this.db
      .select()
      .from(aggregators)
      .where(eq(aggregators.sourceId, sourceId))
      .limit(1);
    return row ?? null;
  }
}
