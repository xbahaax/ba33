import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_TOKEN } from '../../common/database/database.module';
import type { Database } from '../../common/database/client';

@Injectable()
export class RulesRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async findByKey(ruleKey: string) {
    const [rule] = await this.db
      .select()
      .from(rulesConfig)
      .where(and(eq(rulesConfig.ruleKey, ruleKey), isNull(rulesConfig.effectiveTo)))
      .orderBy(desc(rulesConfig.effectiveFrom))
      .limit(1);
    return rule ?? null;
  }

  async findAll() {
    return this.db
      .select()
      .from(rulesConfig)
      .where(isNull(rulesConfig.effectiveTo))
      .orderBy(rulesConfig.ruleKey);
  }

  async create(data: {
    id: string;
    ruleKey: string;
    value: unknown;
    description?: string;
    version: number;
    effectiveFrom: Date;
    effectiveTo?: Date;
    createdBy: string;
  }) {
    const [rule] = await this.db.insert(rulesConfig).values(data).returning();
    return rule;
  }

  async update(id: string, data: Partial<{ value: unknown; version: number; effectiveTo: Date }>) {
    const [rule] = await this.db
      .update(rulesConfig)
      .set(data)
      .where(eq(rulesConfig.id, id))
      .returning();
    return rule;
  }
}
