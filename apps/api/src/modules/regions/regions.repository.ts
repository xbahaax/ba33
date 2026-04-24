import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_TOKEN } from '../../common/database/database.module';
import type { Database } from '../../common/database/client';

@Injectable()
export class RegionsRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async findAll(type?: 'wilaya' | 'commune' | 'village') {
    if (type) {
      return this.db
        .select()
        .from(regions)
        .where(eq(regions.type, type))
        .orderBy(regions.code);
    }
    return this.db.select().from(regions).orderBy(regions.code);
  }

  async findById(id: string) {
    const [region] = await this.db
      .select()
      .from(regions)
      .where(eq(regions.id, id));
    return region ?? null;
  }

  async findByCode(code: string) {
    const [region] = await this.db
      .select()
      .from(regions)
      .where(eq(regions.code, code));
    return region ?? null;
  }

  async findChildren(parentId: string) {
    return this.db
      .select()
      .from(regions)
      .where(eq(regions.parentId, parentId))
      .orderBy(regions.code);
  }

  async create(data: {
    id: string;
    name: string;
    code: string;
    type: 'wilaya' | 'commune' | 'village';
    parentId?: string;
    latitude?: string;
    longitude?: string;
  }) {
    const [region] = await this.db.insert(regions).values(data).returning();
    return region;
  }

  async seed(wilayaData: Array<{
    id: string;
    name: string;
    code: string;
    type: 'wilaya';
  }>) {
    return this.db.insert(regions).values(wilayaData).onConflictDoNothing().returning();
  }
}
