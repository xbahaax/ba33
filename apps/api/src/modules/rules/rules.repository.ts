import { Inject, Injectable } from '@nestjs/common';
import { desc, eq, sql } from 'drizzle-orm';
import { DATABASE_TOKEN } from '../../common/database/database.module';
import type { Database } from '../../common/database/client';
import { rulesConfig, users } from '../../common/database/schema';

@Injectable()
export class RulesRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async getOverview() {
    const [total] = await this.db
      .select({
        count: sql<number>`count(*)::int`,
      })
      .from(rulesConfig);

    const [active] = await this.db
      .select({
        count: sql<number>`count(*)::int`,
      })
      .from(rulesConfig)
      .where(sql`${rulesConfig.effectiveTo} is null`);

    const rules = await this.db
      .select({
        id: rulesConfig.id,
        ruleKey: rulesConfig.ruleKey,
        description: rulesConfig.description,
        version: rulesConfig.version,
        effectiveFrom: rulesConfig.effectiveFrom,
        effectiveTo: rulesConfig.effectiveTo,
        createdAt: rulesConfig.createdAt,
        createdByName: users.fullName,
      })
      .from(rulesConfig)
      .leftJoin(users, eq(rulesConfig.createdBy, users.id))
      .orderBy(desc(rulesConfig.effectiveFrom))
      .limit(12);

    return {
      summary: {
        totalRules: total?.count ?? 0,
        activeRules: active?.count ?? 0,
      },
      rules,
    };
  }
}
