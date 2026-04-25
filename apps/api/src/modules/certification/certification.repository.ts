import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { desc, eq, inArray, sql } from 'drizzle-orm';
import { DATABASE_TOKEN } from '../../common/database/database.module';
import type { Database } from '../../common/database/client';
import {
  certifications,
  buyerCatalogProducts,
  lots,
  products,
  productionRunLots,
  users,
} from '../../common/database/schema';
import { appendWorkflowEvent } from '../../common/workflow/workflow-events';

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

      const [product] = await tx
        .select({
          id: products.id,
          productCode: products.productCode,
          track: products.track,
          weightKg: products.weightKg,
          createdAt: products.createdAt,
        })
        .from(products)
        .where(eq(products.id, certification.productId))
        .limit(1);

      if (product) {
        const productType = product.track === 'd4_bio' ? 'P2' : 'P1';
        const availableQuantityKg = Number(product.weightKg ?? 0);
        const traceability = buildCatalogTraceability({
          certifiedAt: issuedAt,
          productCode: product.productCode,
          productType,
          signature,
          weightKg: availableQuantityKg,
        });

        await tx
          .insert(buyerCatalogProducts)
          .values({
            id: product.id,
            code: product.productCode,
            name: productType === 'P2' ? 'Amendement organique NFN' : 'Produit laine certifie NFN',
            type: productType,
            grade: 'A',
            region: 'Algerie',
            availableQuantityKg: availableQuantityKg.toFixed(2),
            pricePerKgDzd: productType === 'P2' ? '850.00' : '1200.00',
            pricePerKgEur: productType === 'P2' ? '5.50' : '7.80',
            nfnSealStatus: 'certified',
            nfnSealCode: signature,
            nfnCertifiedAt: issuedAt,
            description: 'Produit certifie NFN publie automatiquement depuis la chaine de transformation ba33.',
            images: [],
            qualityParameters: {
              fiberLengthMm: 0,
              fiberDiameterMicrons: 0,
              moisturePercent: 0,
              washingYieldR1Percent: 0,
              cleanlinessScore: 5,
              colorDescription: 'non renseigne',
              sourceLotId: product.id,
            },
            traceability,
            createdAt: product.createdAt,
            updatedAt: issuedAt,
          })
          .onConflictDoUpdate({
            target: buyerCatalogProducts.id,
            set: {
              availableQuantityKg: availableQuantityKg.toFixed(2),
              nfnSealStatus: 'certified',
              nfnSealCode: signature,
              nfnCertifiedAt: issuedAt,
              traceability,
              updatedAt: issuedAt,
            },
          });
      }

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

      await tx
        .update(buyerCatalogProducts)
        .set({
          nfnSealStatus: 'revoked',
          updatedAt: revokedAt,
        })
        .where(eq(buyerCatalogProducts.code, certification.productCode));

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

function buildCatalogTraceability(input: {
  certifiedAt: Date;
  productCode: string;
  productType: 'P1' | 'P2';
  signature: string;
  weightKg: number;
}) {
  const iso = input.certifiedAt.toISOString();

  return {
    collectionEvent: {
      sourceType: 'C1',
      region: 'Algerie',
      commune: 'ba33',
      collectedAt: iso,
      declaredWeightKg: input.weightKg,
    },
    depotD1Event: {
      receivedAt: iso,
      weighedWeightKg: input.weightKg,
      varianceKg: 0,
      siteName: 'Depot ba33',
    },
    transportEvent: {
      departedAt: iso,
      arrivedAt: iso,
      distanceKm: 0,
      coldChainRequired: false,
      origin: 'Collecte ba33',
      destination: 'Transformation ba33',
    },
    laverieD2Event: {
      processedAt: iso,
      dirtyWeightKg: input.weightKg,
      cleanWeightKg: input.weightKg,
      yieldPercent: 100,
      assignedGrade: 'A',
      siteName: 'Laverie ba33',
    },
    transformationEvent: {
      processedAt: iso,
      siteName: input.productType === 'P2' ? 'Transformation D4' : 'Transformation D3',
      batchNumber: input.productCode,
      inputWeightKg: input.weightKg,
      outputWeightKg: input.weightKg,
    },
    certificationEvent: {
      certifiedAt: iso,
      sealCode: input.signature,
      signatureSnippet: input.signature.slice(-12),
    },
  };
}
