import { Inject, Injectable } from '@nestjs/common';
import { desc, eq, sql } from 'drizzle-orm';
import { DATABASE_TOKEN } from '../../common/database/database.module';
import type { Database } from '../../common/database/client';
import { certifications, users } from '../../common/database/schema';

@Injectable()
export class CertificationRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async getOverview() {
    const statusBreakdown = await this.db
      .select({
        status: certifications.status,
        count: sql<number>`count(*)::int`,
      })
      .from(certifications)
      .groupBy(certifications.status)
      .orderBy(certifications.status);

    const recentCertifications = await this.db
      .select({
        id: certifications.id,
        productCode: certifications.productCode,
        status: certifications.status,
        qrCodeUrl: certifications.qrCodeUrl,
        issuedAt: certifications.issuedAt,
        revokedAt: certifications.revokedAt,
        createdAt: certifications.createdAt,
        issuedByName: users.fullName,
      })
      .from(certifications)
      .leftJoin(users, eq(certifications.issuedBy, users.id))
      .orderBy(desc(certifications.createdAt))
      .limit(8);

    const breakdownMap = new Map(statusBreakdown.map((row) => [row.status, row.count]));

    return {
      summary: {
        totalCertifications: statusBreakdown.reduce((sum, row) => sum + row.count, 0),
        pending: breakdownMap.get('pending') ?? 0,
        issued: breakdownMap.get('issued') ?? 0,
        revoked: breakdownMap.get('revoked') ?? 0,
        statusBreakdown,
      },
      certifications: recentCertifications,
    };
  }
}
