import { Inject, Injectable } from '@nestjs/common';
import { desc, eq, sql } from 'drizzle-orm';
import { DATABASE_TOKEN } from '../../common/database/database.module';
import type { Database } from '../../common/database/client';
import { regions, users } from '../../common/database/schema';

@Injectable()
export class UsersRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async getOverview() {
    const typeBreakdown = await this.db
      .select({
        userType: users.userType,
        count: sql<number>`count(*)::int`,
      })
      .from(users)
      .groupBy(users.userType)
      .orderBy(users.userType);

    const statusBreakdown = await this.db
      .select({
        status: users.status,
        count: sql<number>`count(*)::int`,
      })
      .from(users)
      .groupBy(users.status)
      .orderBy(users.status);

    const recentUsers = await this.db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        phone: users.phone,
        userType: users.userType,
        status: users.status,
        lastLoginAt: users.lastLoginAt,
        createdAt: users.createdAt,
        regionName: regions.name,
      })
      .from(users)
      .leftJoin(regions, eq(users.regionId, regions.id))
      .orderBy(desc(users.createdAt))
      .limit(12);

    const statusMap = new Map(statusBreakdown.map((row) => [row.status, row.count]));

    return {
      summary: {
        totalUsers: typeBreakdown.reduce((sum, row) => sum + row.count, 0),
        activeUsers: statusMap.get('active') ?? 0,
        suspendedUsers: statusMap.get('suspended') ?? 0,
        deletedUsers: statusMap.get('deleted') ?? 0,
        typeBreakdown,
        statusBreakdown,
      },
      users: recentUsers,
    };
  }
}
