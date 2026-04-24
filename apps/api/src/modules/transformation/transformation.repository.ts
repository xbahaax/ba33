import { Inject, Injectable } from '@nestjs/common';
import { desc, eq, isNull, sql } from 'drizzle-orm';
import { DATABASE_TOKEN } from '../../common/database/database.module';
import type { Database } from '../../common/database/client';
import { products, productionRuns, transformers, users } from '../../common/database/schema';

@Injectable()
export class TransformationRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async getOverview() {
    const facilities = await this.db
      .select({
        id: transformers.id,
        name: transformers.name,
        track: transformers.track,
        address: transformers.address,
        dailyCapacityKg: transformers.dailyCapacityKg,
        active: transformers.active,
        managerName: users.fullName,
      })
      .from(transformers)
      .leftJoin(users, eq(transformers.managerId, users.id))
      .orderBy(desc(transformers.createdAt));

    const activeRuns = await this.db
      .select({
        id: productionRuns.id,
        transformerName: transformers.name,
        inputWeightKg: productionRuns.inputWeightKg,
        outputWeightKg: productionRuns.outputWeightKg,
        startedAt: productionRuns.startedAt,
        operatorName: users.fullName,
      })
      .from(productionRuns)
      .leftJoin(transformers, eq(productionRuns.transformerId, transformers.id))
      .leftJoin(users, eq(productionRuns.operatedBy, users.id))
      .where(isNull(productionRuns.completedAt))
      .orderBy(desc(productionRuns.startedAt))
      .limit(6);

    const recentProducts = await this.db
      .select({
        id: products.id,
        productCode: products.productCode,
        productTypeCode: products.productTypeCode,
        track: products.track,
        quantity: products.quantity,
        weightKg: products.weightKg,
        status: products.status,
        createdAt: products.createdAt,
      })
      .from(products)
      .orderBy(desc(products.createdAt))
      .limit(8);

    const [runCount] = await this.db
      .select({
        count: sql<number>`count(*)::int`,
      })
      .from(productionRuns);

    return {
      summary: {
        totalTransformers: facilities.length,
        activeTransformers: facilities.filter((facility) => facility.active).length,
        activeRuns: activeRuns.length,
        totalRuns: runCount?.count ?? 0,
        recentProducts: recentProducts.length,
      },
      transformers: facilities,
      activeRuns,
      recentProducts,
    };
  }
}
