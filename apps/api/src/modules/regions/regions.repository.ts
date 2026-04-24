import { Inject, Injectable } from '@nestjs/common';
import { asc, sql } from 'drizzle-orm';
import { DATABASE_TOKEN } from '../../common/database/database.module';
import type { Database } from '../../common/database/client';
import { regions } from '../../common/database/schema';

@Injectable()
export class RegionsRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async getOverview() {
    const typeBreakdown = await this.db
      .select({
        type: regions.type,
        count: sql<number>`count(*)::int`,
      })
      .from(regions)
      .groupBy(regions.type)
      .orderBy(regions.type);

    const regionRows = await this.db
      .select({
        id: regions.id,
        name: regions.name,
        code: regions.code,
        parentId: regions.parentId,
        type: regions.type,
        latitude: regions.latitude,
        longitude: regions.longitude,
        createdAt: regions.createdAt,
      })
      .from(regions)
      .orderBy(asc(regions.type), asc(regions.name))
      .limit(30);

    return {
      summary: {
        totalRegions: typeBreakdown.reduce((sum, row) => sum + row.count, 0),
        typeBreakdown,
      },
      regions: regionRows,
    };
  }
}
