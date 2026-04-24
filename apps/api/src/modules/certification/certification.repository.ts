import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { desc, eq, inArray, sql } from 'drizzle-orm';
import { DATABASE_TOKEN } from '../../common/database/database.module';
import type { Database } from '../../common/database/client';

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
        gatesPassed: certifications.gatesPassed,
        issuedAt: certifications.issuedAt,
        revokedAt: certifications.revokedAt,
        revokedReason: certifications.revokedReason,
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

  async issue(
    certificationId: string,
    force: boolean,
    actorId: string,
    actorType: string,
  ) {
    const [certification] = await this.db
      .select({
        id: certifications.id,
        productId: certifications.productId,
        productCode: certifications.productCode,
        status: certifications.status,
        gatesPassed: certifications.gatesPassed,
      })
      .from(certifications)
      .where(eq(certifications.id, certificationId))
      .limit(1);

    if (!certification) {
      throw new NotFoundException('Certification introuvable.');
    }

    if (certification.status !== 'pending') {
      throw new BadRequestException('Seules les certifications en attente peuvent être émises.');
    }

    const gatesPassed =
      certification.gatesPassed && typeof certification.gatesPassed === 'object'
        ? (certification.gatesPassed as Record<string, boolean>)
        : null;
    const allGatesPassed = gatesPassed
      ? Object.values(gatesPassed).every(Boolean)
      : false;

    if (!allGatesPassed && !force) {
      throw new BadRequestException('Toutes les gates doivent être validées ou l’émission doit être forcée.');
    }

    const issuedAt = new Date();
    const signature = `NFN-${certification.productCode}-${issuedAt.getTime()}`;

    return this.db.transaction(async (tx) => {
      await tx
        .update(certifications)
        .set({
          status: 'issued',
          signature,
          issuedBy: actorId,
          issuedAt,
          revokedAt: null,
          revokedReason: null,
          updatedAt: issuedAt,
        })
        .where(eq(certifications.id, certificationId));

      await tx
        .update(products)
        .set({
          status: 'certified',
          certificationId,
          updatedAt: issuedAt,
        })
        .where(eq(products.id, certification.productId));

      const lotRows = await tx
        .select({
          lotId: productionRunLots.lotId,
        })
        .from(productionRunLots)
        .innerJoin(products, eq(products.productionRunId, productionRunLots.runId))
        .where(eq(products.id, certification.productId));

      const lotIds = lotRows.map((row) => row.lotId);

      if (lotIds.length > 0) {
        await tx
          .update(lots)
          .set({
            status: 'certified',
            updatedAt: issuedAt,
          })
          .where(inArray(lots.id, lotIds));
      }

      await appendWorkflowEvent(tx, {
        aggregateId: certificationId,
        aggregateType: 'certification',
        actorId,
        actorType,
        eventType: 'certification_issued',
        occurredAt: issuedAt,
        payload: {
          force,
          productCode: certification.productCode,
          signature,
        },
      });

      const [updatedCertification] = await tx
        .select({
          id: certifications.id,
          productCode: certifications.productCode,
          status: certifications.status,
          qrCodeUrl: certifications.qrCodeUrl,
          gatesPassed: certifications.gatesPassed,
          issuedAt: certifications.issuedAt,
          revokedAt: certifications.revokedAt,
          revokedReason: certifications.revokedReason,
          createdAt: certifications.createdAt,
          issuedByName: users.fullName,
        })
        .from(certifications)
        .leftJoin(users, eq(certifications.issuedBy, users.id))
        .where(eq(certifications.id, certificationId))
        .limit(1);

      return updatedCertification;
    });
  }

  async revoke(
    certificationId: string,
    reason: string,
    actorId: string,
    actorType: string,
  ) {
    const [certification] = await this.db
      .select({
        id: certifications.id,
        productId: certifications.productId,
        productCode: certifications.productCode,
        status: certifications.status,
      })
      .from(certifications)
      .where(eq(certifications.id, certificationId))
      .limit(1);

    if (!certification) {
      throw new NotFoundException('Certification introuvable.');
    }

    if (certification.status !== 'issued') {
      throw new BadRequestException('Seules les certifications émises peuvent être révoquées.');
    }

    const revokedAt = new Date();

    return this.db.transaction(async (tx) => {
      await tx
        .update(certifications)
        .set({
          status: 'revoked',
          revokedAt,
          revokedReason: reason,
          updatedAt: revokedAt,
        })
        .where(eq(certifications.id, certificationId));

      await tx
        .update(products)
        .set({
          status: 'rejected',
          updatedAt: revokedAt,
        })
        .where(eq(products.id, certification.productId));

      await appendWorkflowEvent(tx, {
        aggregateId: certificationId,
        aggregateType: 'certification',
        actorId,
        actorType,
        eventType: 'certification_revoked',
        occurredAt: revokedAt,
        payload: {
          productCode: certification.productCode,
          reason,
        },
      });

      const [updatedCertification] = await tx
        .select({
          id: certifications.id,
          productCode: certifications.productCode,
          status: certifications.status,
          qrCodeUrl: certifications.qrCodeUrl,
          gatesPassed: certifications.gatesPassed,
          issuedAt: certifications.issuedAt,
          revokedAt: certifications.revokedAt,
          revokedReason: certifications.revokedReason,
          createdAt: certifications.createdAt,
          issuedByName: users.fullName,
        })
        .from(certifications)
        .leftJoin(users, eq(certifications.issuedBy, users.id))
        .where(eq(certifications.id, certificationId))
        .limit(1);

      return updatedCertification;
    });
  }
}
