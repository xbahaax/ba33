import { Inject, Injectable } from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';
import { DATABASE_TOKEN } from '../../common/database/database.module';
import type { Database } from '../../common/database/client';
import { smsMessages, sources } from '../../common/database/schema';

@Injectable()
export class SmsGatewayRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async findSourceByPhone(phone: string) {
    const [row] = await this.db
      .select({
        id: sources.id,
        name: sources.name,
        sourceType: sources.sourceType,
        latitude: sources.latitude,
        longitude: sources.longitude,
      })
      .from(sources)
      .where(eq(sources.contactPhone, phone))
      .limit(1);

    return row ?? null;
  }

  async createMessage(data: typeof smsMessages.$inferInsert) {
    const [row] = await this.db.insert(smsMessages).values(data).returning();
    return row;
  }

  async findRecent(limit = 20) {
    return this.db.select().from(smsMessages).orderBy(desc(smsMessages.createdAt)).limit(limit);
  }
}
