import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { desc, eq, sql } from 'drizzle-orm';
import { DATABASE_TOKEN } from '../../common/database/database.module';
import type { Database } from '../../common/database/client';

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
        value: rulesConfig.value,
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
      rules: rules.map((rule) => ({
        ...rule,
        isActive: rule.effectiveTo === null,
      })),
    };
  }

  async versionRule(ruleId: string, input: UpdateRuleDto, actorId: string) {
    const [existingRule] = await this.db
      .select({
        id: rulesConfig.id,
        ruleKey: rulesConfig.ruleKey,
        value: rulesConfig.value,
        description: rulesConfig.description,
        version: rulesConfig.version,
      })
      .from(rulesConfig)
      .where(eq(rulesConfig.id, ruleId))
      .limit(1);

    if (!existingRule) {
      throw new NotFoundException('Rule not found.');
    }

    const now = new Date();

    await this.db
      .update(rulesConfig)
      .set({
        effectiveTo: now,
      })
      .where(eq(rulesConfig.id, ruleId));

    const [nextRule] = await this.db
      .insert(rulesConfig)
      .values({
        ruleKey: existingRule.ruleKey,
        value: input.value ?? existingRule.value,
        description: input.description ?? existingRule.description,
        version: (existingRule.version ?? 0) + 1,
        effectiveFrom: now,
        createdBy: actorId,
      })
      .returning({
        id: rulesConfig.id,
        ruleKey: rulesConfig.ruleKey,
        description: rulesConfig.description,
        version: rulesConfig.version,
        value: rulesConfig.value,
        effectiveFrom: rulesConfig.effectiveFrom,
        effectiveTo: rulesConfig.effectiveTo,
        createdAt: rulesConfig.createdAt,
      });

    return nextRule;
  }
}
