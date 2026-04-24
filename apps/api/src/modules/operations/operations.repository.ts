import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  and,
  asc,
  desc,
  eq,
  inArray,
  isNotNull,
  notInArray,
  or,
  sql,
} from 'drizzle-orm';
import { DATABASE_TOKEN } from '../../common/database/database.module';
import type { Database } from '../../common/database/client';
import {
  a1Alerts,
  buyers,
  certifications,
  depotReceptions,
  depotZones,
  depots,
  events,
  laveries,
  lots,
  lotWeighs,
  orders,
  preLots,
  pricingProposals,
  products,
  productionRunLots,
  productionRuns,
  qualifications,
  regions,
  rulesConfig,
  sources,
  transportJobLots,
  transportJobs,
  transformers,
  users,
  washingRuns,
} from '../../common/database/schema';

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

@Injectable()
export class OperationsRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async getCommandCenter() {
    const [
      announcedPreLots,
      inTransitLots,
      depotLots,
      activeWashRuns,
      activeProductionRuns,
      pendingCertifications,
      openOrders,
      openA1Alerts,
      recentEvents,
      safetyFindings,
      transportWatch,
      sourceNodes,
      depotNodes,
      laverieNodes,
      transformerNodes,
    ] = await Promise.all([
      this.db
        .select({
          count: sql<number>`count(*)::int`,
          weightKg: sql<number>`coalesce(sum(${preLots.estimatedWeightKg}), 0)::float8`,
        })
        .from(preLots)
        .where(inArray(preLots.status, ['announced', 'assigned'])),
      this.db
        .select({
          count: sql<number>`count(*)::int`,
          weightKg: sql<number>`coalesce(sum(coalesce(${lots.actualWeightKg}, ${lots.declaredWeightKg})), 0)::float8`,
        })
        .from(lots)
        .where(eq(lots.status, 'in_transit')),
      this.db
        .select({
          count: sql<number>`count(*)::int`,
          weightKg: sql<number>`coalesce(sum(coalesce(${lots.actualWeightKg}, ${lots.declaredWeightKg})), 0)::float8`,
        })
        .from(lots)
        .where(inArray(lots.status, ['received_depot', 'in_pretri', 'stored'])),
      this.db
        .select({
          count: sql<number>`count(*)::int`,
          weightKg: sql<number>`coalesce(sum(${washingRuns.dirtyWeightKg}), 0)::float8`,
        })
        .from(washingRuns)
        .where(sql`${washingRuns.completedAt} is null`),
      this.db
        .select({
          count: sql<number>`count(*)::int`,
          weightKg: sql<number>`coalesce(sum(${productionRuns.inputWeightKg}), 0)::float8`,
        })
        .from(productionRuns)
        .where(sql`${productionRuns.completedAt} is null`),
      this.db
        .select({
          count: sql<number>`count(*)::int`,
        })
        .from(certifications)
        .where(eq(certifications.status, 'pending')),
      this.db
        .select({
          count: sql<number>`count(*)::int`,
          totalValue: sql<number>`coalesce(sum(${orders.total}), 0)::float8`,
        })
        .from(orders)
        .where(notInArray(orders.status, ['delivered', 'returned', 'cancelled'])),
      this.db
        .select({
          count: sql<number>`count(*)::int`,
        })
        .from(a1Alerts)
        .where(notInArray(a1Alerts.status, ['resolved'])),
      this.db
        .select({
          id: events.id,
          eventType: events.eventType,
          aggregateType: events.aggregateType,
          aggregateId: events.aggregateId,
          actorType: events.actorType,
          actorName: users.fullName,
          occurredAt: events.occurredAt,
        })
        .from(events)
        .leftJoin(users, eq(events.actorId, users.id))
        .orderBy(desc(events.occurredAt))
        .limit(10),
      this.db
        .select({
          id: qualifications.id,
          lotId: qualifications.lotId,
          lotQrCode: lots.qrCode,
          grade: qualifications.grade,
          safetyStatus: qualifications.safetyStatus,
          contaminationNotes: qualifications.contaminationNotes,
          performedAt: qualifications.performedAt,
          analystName: users.fullName,
        })
        .from(qualifications)
        .leftJoin(lots, eq(qualifications.lotId, lots.id))
        .leftJoin(users, eq(qualifications.performedBy, users.id))
        .where(
          or(
            notInArray(qualifications.safetyStatus, ['clear']),
            isNotNull(qualifications.contaminationNotes),
          ),
        )
        .orderBy(desc(qualifications.performedAt))
        .limit(6),
      this.db
        .select({
          id: transportJobs.id,
          lane: transportJobs.lane,
          status: transportJobs.status,
          originType: transportJobs.originType,
          destinationType: transportJobs.destinationType,
          requestedAt: transportJobs.requestedAt,
          slaDeadline: transportJobs.slaDeadline,
          transporterName: users.fullName,
          lotCount: sql<number>`count(${transportJobLots.lotId})::int`,
        })
        .from(transportJobs)
        .leftJoin(users, eq(transportJobs.transporterId, users.id))
        .leftJoin(transportJobLots, eq(transportJobs.id, transportJobLots.jobId))
        .where(inArray(transportJobs.status, ['pending', 'accepted', 'in_progress']))
        .groupBy(transportJobs.id, users.fullName)
        .orderBy(asc(transportJobs.slaDeadline))
        .limit(6),
      this.db
        .select({
          id: sources.id,
          label: sources.name,
          nodeType: sql<string>`'source'`,
          status: sources.status,
          regionName: regions.name,
          latitude: sources.latitude,
          longitude: sources.longitude,
        })
        .from(sources)
        .leftJoin(regions, eq(sources.regionId, regions.id))
        .orderBy(asc(sources.name)),
      this.db
        .select({
          id: depots.id,
          label: depots.name,
          nodeType: sql<string>`'depot'`,
          status: sql<string>`case when ${depots.active} then 'active' else 'suspended' end`,
          regionName: regions.name,
          latitude: regions.latitude,
          longitude: regions.longitude,
        })
        .from(depots)
        .leftJoin(regions, eq(depots.regionId, regions.id))
        .orderBy(asc(depots.name)),
      this.db
        .select({
          id: laveries.id,
          label: laveries.name,
          nodeType: sql<string>`'laverie'`,
          status: sql<string>`case when ${laveries.active} then 'active' else 'suspended' end`,
          regionName: regions.name,
          latitude: regions.latitude,
          longitude: regions.longitude,
        })
        .from(laveries)
        .leftJoin(regions, eq(laveries.regionId, regions.id))
        .orderBy(asc(laveries.name)),
      this.db
        .select({
          id: transformers.id,
          label: transformers.name,
          nodeType: sql<string>`'transformer'`,
          status: sql<string>`case when ${transformers.active} then 'active' else 'suspended' end`,
          regionName: regions.name,
          latitude: regions.latitude,
          longitude: regions.longitude,
        })
        .from(transformers)
        .leftJoin(regions, eq(transformers.regionId, regions.id))
        .orderBy(asc(transformers.name)),
    ]);

    const activeAlerts = await this.db
      .select({
        id: a1Alerts.id,
        type: sql<string>`'a1_alert'`,
        title: depots.name,
        severity: a1Alerts.severity,
        status: a1Alerts.status,
        detail: sql<string>`concat('A1 ', ${a1Alerts.severity}, ' - ', coalesce(${depots.name}, 'Dépôt'))`,
        occurredAt: a1Alerts.firedAt,
      })
      .from(a1Alerts)
      .leftJoin(depots, eq(a1Alerts.depotId, depots.id))
      .where(notInArray(a1Alerts.status, ['resolved']))
      .orderBy(desc(a1Alerts.firedAt))
      .limit(6);

    const pendingCertRows = await this.db
      .select({
        id: certifications.id,
        type: sql<string>`'certification'`,
        title: certifications.productCode,
        severity: sql<string>`'warning'`,
        status: certifications.status,
        detail: sql<string>`concat('Certification ', ${certifications.status})`,
        occurredAt: certifications.createdAt,
      })
      .from(certifications)
      .where(eq(certifications.status, 'pending'))
      .orderBy(desc(certifications.createdAt))
      .limit(6);

    const flow = [
      {
        stage: 'collection',
        label: 'Collecte annoncée',
        count: announcedPreLots[0]?.count ?? 0,
        weightKg: announcedPreLots[0]?.weightKg ?? 0,
      },
      {
        stage: 'transport',
        label: 'En transit',
        count: inTransitLots[0]?.count ?? 0,
        weightKg: inTransitLots[0]?.weightKg ?? 0,
      },
      {
        stage: 'depot',
        label: 'En dépôt D1',
        count: depotLots[0]?.count ?? 0,
        weightKg: depotLots[0]?.weightKg ?? 0,
      },
      {
        stage: 'laverie',
        label: 'En lavage D2',
        count: activeWashRuns[0]?.count ?? 0,
        weightKg: activeWashRuns[0]?.weightKg ?? 0,
      },
      {
        stage: 'transformation',
        label: 'En transformation',
        count: activeProductionRuns[0]?.count ?? 0,
        weightKg: activeProductionRuns[0]?.weightKg ?? 0,
      },
      {
        stage: 'sales',
        label: 'Commandes ouvertes',
        count: openOrders[0]?.count ?? 0,
        weightKg: openOrders[0]?.totalValue ?? 0,
      },
    ];

    return {
      summary: {
        announcedPreLots: announcedPreLots[0]?.count ?? 0,
        announcedWeightKg: announcedPreLots[0]?.weightKg ?? 0,
        inTransitLots: inTransitLots[0]?.count ?? 0,
        inTransitWeightKg: inTransitLots[0]?.weightKg ?? 0,
        depotLots: depotLots[0]?.count ?? 0,
        depotWeightKg: depotLots[0]?.weightKg ?? 0,
        activeWashRuns: activeWashRuns[0]?.count ?? 0,
        washingWeightKg: activeWashRuns[0]?.weightKg ?? 0,
        activeProductionRuns: activeProductionRuns[0]?.count ?? 0,
        productionWeightKg: activeProductionRuns[0]?.weightKg ?? 0,
        pendingCertifications: pendingCertifications[0]?.count ?? 0,
        openOrders: openOrders[0]?.count ?? 0,
        openAlerts: openA1Alerts[0]?.count ?? 0,
      },
      flow,
      alerts: [
        ...activeAlerts,
        ...safetyFindings.map((item) => ({
          id: item.id,
          type: 'safety',
          title: item.lotQrCode ?? item.lotId,
          severity: item.safetyStatus === 'rejected' ? 'critical' : 'warning',
          status: item.safetyStatus,
          detail: item.contaminationNotes ?? `Grade ${item.grade} / sécurité ${item.safetyStatus}`,
          occurredAt: item.performedAt,
        })),
        ...pendingCertRows,
      ]
        .sort((left, right) => {
          return (
            new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime()
          );
        })
        .slice(0, 12),
      recentEvents,
      transportWatch,
      terrainNodes: [
        ...sourceNodes,
        ...depotNodes,
        ...laverieNodes,
        ...transformerNodes,
      ],
    };
  }

  async getFulfillmentOverview() {
    const [
      collectionQueue,
      transportQueue,
      depotQueue,
      washingQueue,
      qualificationQueue,
      productionQueue,
      salesQueue,
    ] = await Promise.all([
      this.db
        .select({
          id: preLots.id,
          status: preLots.status,
          estimatedWeightKg: preLots.estimatedWeightKg,
          scheduledAt: preLots.scheduledAt,
          sourceName: sources.name,
          sourceType: sources.sourceType,
          regionName: regions.name,
          assignedCollectorName: users.fullName,
        })
        .from(preLots)
        .leftJoin(sources, eq(preLots.sourceId, sources.id))
        .leftJoin(regions, eq(preLots.regionId, regions.id))
        .leftJoin(users, eq(preLots.assignedCollectorId, users.id))
        .where(inArray(preLots.status, ['announced', 'assigned']))
        .orderBy(asc(preLots.scheduledAt), desc(preLots.createdAt))
        .limit(12),
      this.db
        .select({
          id: transportJobs.id,
          lane: transportJobs.lane,
          status: transportJobs.status,
          originType: transportJobs.originType,
          destinationType: transportJobs.destinationType,
          requestedAt: transportJobs.requestedAt,
          acceptedAt: transportJobs.acceptedAt,
          slaDeadline: transportJobs.slaDeadline,
          transporterName: users.fullName,
          lotCount: sql<number>`count(${transportJobLots.lotId})::int`,
        })
        .from(transportJobs)
        .leftJoin(users, eq(transportJobs.transporterId, users.id))
        .leftJoin(transportJobLots, eq(transportJobs.id, transportJobLots.jobId))
        .where(inArray(transportJobs.status, ['pending', 'accepted', 'in_progress']))
        .groupBy(transportJobs.id, users.fullName)
        .orderBy(asc(transportJobs.slaDeadline))
        .limit(12),
      this.db
        .select({
          id: lots.id,
          qrCode: lots.qrCode,
          status: lots.status,
          urgency: lots.urgency,
          sourceType: lots.sourceType,
          weightKg: sql<number>`coalesce(${lots.actualWeightKg}, ${lots.declaredWeightKg}, 0)::float8`,
          collectedAt: lots.collectedAt,
          depotName: depots.name,
          zoneCode: depotZones.code,
        })
        .from(lots)
        .leftJoin(depotReceptions, eq(depotReceptions.lotId, lots.id))
        .leftJoin(depots, eq(depotReceptions.depotId, depots.id))
        .leftJoin(depotZones, eq(depotReceptions.zoneId, depotZones.id))
        .where(inArray(lots.status, ['received_depot', 'in_pretri', 'stored', 'dispatched_to_laverie']))
        .orderBy(asc(lots.collectedAt))
        .limit(12),
      this.db
        .select({
          id: washingRuns.id,
          lotId: washingRuns.lotId,
          lotQrCode: lots.qrCode,
          laverieName: laveries.name,
          dirtyWeightKg: washingRuns.dirtyWeightKg,
          cleanWeightKg: washingRuns.cleanWeightKg,
          startedAt: washingRuns.startedAt,
          completedAt: washingRuns.completedAt,
          operatorName: users.fullName,
        })
        .from(washingRuns)
        .leftJoin(lots, eq(washingRuns.lotId, lots.id))
        .leftJoin(laveries, eq(washingRuns.laverieId, laveries.id))
        .leftJoin(users, eq(washingRuns.operatedBy, users.id))
        .where(sql`${washingRuns.completedAt} is null`)
        .orderBy(asc(washingRuns.startedAt))
        .limit(10),
      this.db
        .select({
          id: qualifications.id,
          lotId: qualifications.lotId,
          lotQrCode: lots.qrCode,
          grade: qualifications.grade,
          safetyStatus: qualifications.safetyStatus,
          performedAt: qualifications.performedAt,
          analystName: users.fullName,
        })
        .from(qualifications)
        .leftJoin(lots, eq(qualifications.lotId, lots.id))
        .leftJoin(users, eq(qualifications.performedBy, users.id))
        .orderBy(desc(qualifications.performedAt))
        .limit(10),
      this.db
        .select({
          id: productionRuns.id,
          status: sql<string>`case when ${productionRuns.completedAt} is null then 'in_progress' else 'completed' end`,
          transformerName: transformers.name,
          productName: sql<string>`coalesce(${products.productCode}, ${products.productTypeCode}, 'Production run')`,
          track: transformers.track,
          inputWeightKg: productionRuns.inputWeightKg,
          outputWeightKg: productionRuns.outputWeightKg,
          startedAt: productionRuns.startedAt,
          completedAt: productionRuns.completedAt,
          operatorName: users.fullName,
        })
        .from(productionRuns)
        .leftJoin(transformers, eq(productionRuns.transformerId, transformers.id))
        .leftJoin(users, eq(productionRuns.operatedBy, users.id))
        .leftJoin(products, eq(products.productionRunId, productionRuns.id))
        .orderBy(desc(productionRuns.startedAt))
        .limit(12),
      this.db
        .select({
          id: orders.id,
          buyerCompanyName: buyers.companyName,
          channel: orders.channel,
          status: orders.status,
          paymentStatus: orders.paymentStatus,
          total: orders.total,
          currency: orders.currency,
          createdAt: orders.createdAt,
          confirmedAt: orders.confirmedAt,
        })
        .from(orders)
        .leftJoin(buyers, eq(orders.buyerId, buyers.userId))
        .where(notInArray(orders.status, ['delivered', 'returned', 'cancelled']))
        .orderBy(asc(orders.createdAt))
        .limit(12),
    ]);

    return {
      summary: {
        collectionQueue: collectionQueue.length,
        transportQueue: transportQueue.length,
        depotQueue: depotQueue.length,
        washingQueue: washingQueue.length,
        qualificationQueue: qualificationQueue.length,
        productionQueue: productionQueue.length,
        salesQueue: salesQueue.length,
      },
      collectionQueue,
      transportQueue,
      depotQueue,
      washingQueue,
      qualificationQueue,
      productionQueue,
      salesQueue,
    };
  }

  async getValidationOverview() {
    const [a1Queue, depotDiscrepancies, transportDiscrepancies, safetyFindings, certificationQueue, urgentLotsAtRisk] =
      await Promise.all([
        this.db
          .select({
            id: a1Alerts.id,
            depotName: depots.name,
            severity: a1Alerts.severity,
            status: a1Alerts.status,
            firedAt: a1Alerts.firedAt,
            resolvedAt: a1Alerts.resolvedAt,
          })
          .from(a1Alerts)
          .leftJoin(depots, eq(a1Alerts.depotId, depots.id))
          .orderBy(desc(a1Alerts.firedAt))
          .limit(12),
        this.db
          .select({
            id: depotReceptions.id,
            sourceType: sql<string>`'depot'`,
            reference: lots.qrCode,
            phase: sql<string>`'E1 reception'`,
            deltaKg: sql<number>`abs(${depotReceptions.discrepancyKg})::float8`,
            toleranceExceeded: depotReceptions.toleranceExceeded,
            detail: sql<string>`concat(coalesce(${depots.name}, 'Dépôt'), ' / ', coalesce(${depotZones.code}, 'sans zone'))`,
            occurredAt: depotReceptions.receivedAt,
          })
          .from(depotReceptions)
          .leftJoin(lots, eq(depotReceptions.lotId, lots.id))
          .leftJoin(depots, eq(depotReceptions.depotId, depots.id))
          .leftJoin(depotZones, eq(depotReceptions.zoneId, depotZones.id))
          .where(sql`abs(${depotReceptions.discrepancyKg}) > 0`)
          .orderBy(desc(sql`abs(${depotReceptions.discrepancyKg})`), desc(depotReceptions.receivedAt))
          .limit(12),
        this.db
          .select({
            id: sql<string>`concat(${transportJobLots.jobId}::text, '-', ${transportJobLots.lotId}::text)`,
            sourceType: sql<string>`'transport'`,
            reference: lots.qrCode,
            phase: sql<string>`'Load / delivery reconciliation'`,
            deltaKg: sql<number>`abs(${transportJobLots.loadedWeightKg} - ${transportJobLots.deliveredWeightKg})::float8`,
            toleranceExceeded: sql<boolean>`abs(${transportJobLots.loadedWeightKg} - ${transportJobLots.deliveredWeightKg}) > 1`,
            detail: sql<string>`concat('Job ', ${transportJobs.id}::text)`,
            occurredAt: transportJobLots.deliveredAt,
          })
          .from(transportJobLots)
          .innerJoin(transportJobs, eq(transportJobLots.jobId, transportJobs.id))
          .innerJoin(lots, eq(transportJobLots.lotId, lots.id))
          .where(
            and(
              isNotNull(transportJobLots.loadedWeightKg),
              isNotNull(transportJobLots.deliveredWeightKg),
              sql`abs(${transportJobLots.loadedWeightKg} - ${transportJobLots.deliveredWeightKg}) > 0`,
            ),
          )
          .orderBy(desc(sql`abs(${transportJobLots.loadedWeightKg} - ${transportJobLots.deliveredWeightKg})`))
          .limit(12),
        this.db
          .select({
            id: qualifications.id,
            lotQrCode: lots.qrCode,
            grade: qualifications.grade,
            safetyStatus: qualifications.safetyStatus,
            contaminationNotes: qualifications.contaminationNotes,
            performedAt: qualifications.performedAt,
            analystName: users.fullName,
          })
          .from(qualifications)
          .leftJoin(lots, eq(qualifications.lotId, lots.id))
          .leftJoin(users, eq(qualifications.performedBy, users.id))
          .where(
            or(
              notInArray(qualifications.safetyStatus, ['clear']),
              isNotNull(qualifications.contaminationNotes),
            ),
          )
          .orderBy(desc(qualifications.performedAt))
          .limit(12),
        this.db
          .select({
            id: certifications.id,
            productCode: certifications.productCode,
            status: certifications.status,
            gatesPassed: certifications.gatesPassed,
            issuedAt: certifications.issuedAt,
            revokedAt: certifications.revokedAt,
            revokedReason: certifications.revokedReason,
            createdAt: certifications.createdAt,
            issuedByName: users.fullName,
          })
          .from(certifications)
          .leftJoin(users, eq(certifications.issuedBy, users.id))
          .where(inArray(certifications.status, ['pending', 'revoked']))
          .orderBy(desc(certifications.createdAt))
          .limit(12),
        this.db
          .select({
            id: lots.id,
            qrCode: lots.qrCode,
            status: lots.status,
            sourceType: lots.sourceType,
            collectedAt: lots.collectedAt,
            currentLocationType: lots.currentLocationType,
            weightKg: sql<number>`coalesce(${lots.actualWeightKg}, ${lots.declaredWeightKg}, 0)::float8`,
          })
          .from(lots)
          .where(
            and(
              eq(lots.isUrgent, true),
              inArray(lots.status, ['in_transit', 'received_depot', 'stored', 'washing', 'quarantined']),
            ),
          )
          .orderBy(asc(lots.collectedAt))
          .limit(12),
      ]);

    const now = Date.now();

    return {
      summary: {
        openA1Alerts: a1Queue.filter((item) => item.status !== 'resolved').length,
        weightAlerts: depotDiscrepancies.length + transportDiscrepancies.length,
        safetyFlags: safetyFindings.length,
        pendingCertifications: certificationQueue.filter((item) => item.status === 'pending').length,
        revokedCertifications: certificationQueue.filter((item) => item.status === 'revoked').length,
        urgentLotsAtRisk: urgentLotsAtRisk.length,
      },
      a1Queue,
      weightAlerts: [...depotDiscrepancies, ...transportDiscrepancies].sort((left, right) => {
        return right.deltaKg - left.deltaKg;
      }),
      safetyFindings,
      certificationQueue,
      urgentLotsAtRisk: urgentLotsAtRisk.map((lot) => ({
        ...lot,
        ageHours: lot.collectedAt
          ? Math.max(
              0,
              Math.round((now - new Date(lot.collectedAt).getTime()) / (1000 * 60 * 60)),
            )
          : null,
      })),
    };
  }

  async updateA1AlertStatus(alertId: string, status: 'open' | 'acknowledged' | 'resolved') {
    const [existingAlert] = await this.db
      .select({
        id: a1Alerts.id,
      })
      .from(a1Alerts)
      .where(eq(a1Alerts.id, alertId))
      .limit(1);

    if (!existingAlert) {
      throw new NotFoundException('A1 alert not found.');
    }

    const [updatedAlert] = await this.db
      .update(a1Alerts)
      .set({
        status,
        resolvedAt: status === 'resolved' ? new Date() : null,
      })
      .where(eq(a1Alerts.id, alertId))
      .returning({
        id: a1Alerts.id,
        status: a1Alerts.status,
        resolvedAt: a1Alerts.resolvedAt,
      });

    return updatedAlert;
  }

  async lookupTraceability(lookupKey: string) {
    const lotResult = await this.findLotTraceability(lookupKey);

    if (lotResult) {
      return lotResult;
    }

    const productResult = await this.findProductTraceability(lookupKey);

    if (productResult) {
      return productResult;
    }

    const certificationResult = await this.findCertificationTraceability(lookupKey);

    if (certificationResult) {
      return certificationResult;
    }

    return null;
  }

  private async findLotTraceability(lookupKey: string) {
    const conditions = [eq(lots.qrCode, lookupKey)];

    if (isUuid(lookupKey)) {
      conditions.push(eq(lots.id, lookupKey));
    }

    const [lotRecord] = await this.db
      .select({
        id: lots.id,
        qrCode: lots.qrCode,
        status: lots.status,
        sourceType: lots.sourceType,
        declaredWeightKg: lots.declaredWeightKg,
        actualWeightKg: lots.actualWeightKg,
        stateQuick: lots.stateQuick,
        urgency: lots.urgency,
        collectedAt: lots.collectedAt,
        currentLocationType: lots.currentLocationType,
        notes: lots.notes,
        sourceName: sources.name,
        regionName: regions.name,
      })
      .from(lots)
      .leftJoin(sources, eq(lots.sourceId, sources.id))
      .leftJoin(regions, eq(sources.regionId, regions.id))
      .where(or(...conditions))
      .limit(1);

    if (!lotRecord) {
      return null;
    }

    const [weighs, receptions, washings, qualityChecks, downstreamLinks] = await Promise.all([
      this.db
        .select({
          id: lotWeighs.id,
          phase: lotWeighs.phase,
          weightKg: lotWeighs.weightKg,
          source: lotWeighs.source,
          recordedAt: lotWeighs.recordedAt,
        })
        .from(lotWeighs)
        .where(eq(lotWeighs.lotId, lotRecord.id))
        .orderBy(asc(lotWeighs.recordedAt)),
      this.db
        .select({
          id: depotReceptions.id,
          depotName: depots.name,
          zoneCode: depotZones.code,
          actualWeightKg: depotReceptions.actualWeightKg,
          discrepancyKg: depotReceptions.discrepancyKg,
          receivedAt: depotReceptions.receivedAt,
        })
        .from(depotReceptions)
        .leftJoin(depots, eq(depotReceptions.depotId, depots.id))
        .leftJoin(depotZones, eq(depotReceptions.zoneId, depotZones.id))
        .where(eq(depotReceptions.lotId, lotRecord.id))
        .orderBy(asc(depotReceptions.receivedAt)),
      this.db
        .select({
          id: washingRuns.id,
          laverieName: laveries.name,
          dirtyWeightKg: washingRuns.dirtyWeightKg,
          cleanWeightKg: washingRuns.cleanWeightKg,
          yieldPercent: washingRuns.yieldPercent,
          startedAt: washingRuns.startedAt,
          completedAt: washingRuns.completedAt,
        })
        .from(washingRuns)
        .leftJoin(laveries, eq(washingRuns.laverieId, laveries.id))
        .where(eq(washingRuns.lotId, lotRecord.id))
        .orderBy(asc(washingRuns.startedAt)),
      this.db
        .select({
          id: qualifications.id,
          grade: qualifications.grade,
          safetyStatus: qualifications.safetyStatus,
          fiberLengthMm: qualifications.fiberLengthMm,
          fiberDiameterMicron: qualifications.fiberDiameterMicron,
          contaminationNotes: qualifications.contaminationNotes,
          performedAt: qualifications.performedAt,
          pricePerKg: pricingProposals.finalPricePerKg,
          totalValue: pricingProposals.totalValue,
        })
        .from(qualifications)
        .leftJoin(pricingProposals, eq(pricingProposals.qualificationId, qualifications.id))
        .where(eq(qualifications.lotId, lotRecord.id))
        .orderBy(asc(qualifications.performedAt)),
      this.db
        .select({
          runId: productionRuns.id,
          transformerName: transformers.name,
          track: transformers.track,
          weightUsedKg: productionRunLots.weightUsedKg,
          productId: products.id,
          productCode: products.productCode,
          productStatus: products.status,
          certificationId: certifications.id,
          certificationStatus: certifications.status,
          createdAt: products.createdAt,
        })
        .from(productionRunLots)
        .innerJoin(productionRuns, eq(productionRunLots.runId, productionRuns.id))
        .leftJoin(transformers, eq(productionRuns.transformerId, transformers.id))
        .leftJoin(products, eq(products.productionRunId, productionRuns.id))
        .leftJoin(certifications, eq(certifications.productId, products.id))
        .where(eq(productionRunLots.lotId, lotRecord.id))
        .orderBy(asc(products.createdAt)),
    ]);

    const eventAggregateIds = [
      lotRecord.id,
      ...washings.map((item) => item.id),
      ...qualityChecks.map((item) => item.id),
      ...downstreamLinks.flatMap((item) => [item.runId, item.productId, item.certificationId]).filter(
        (value): value is string => Boolean(value),
      ),
    ];

    const timeline =
      eventAggregateIds.length > 0
        ? await this.db
            .select({
              id: events.id,
              eventType: events.eventType,
              aggregateType: events.aggregateType,
              aggregateId: events.aggregateId,
              actorType: events.actorType,
              actorName: users.fullName,
              occurredAt: events.occurredAt,
            })
            .from(events)
            .leftJoin(users, eq(events.actorId, users.id))
            .where(inArray(events.aggregateId, eventAggregateIds))
            .orderBy(desc(events.occurredAt))
            .limit(20)
        : [];

    return {
      entityType: 'lot',
      header: {
        title: lotRecord.qrCode,
        subtitle: lotRecord.sourceName,
        status: lotRecord.status,
        sourceType: lotRecord.sourceType,
        regionName: lotRecord.regionName,
        weightKg: Number(lotRecord.actualWeightKg ?? lotRecord.declaredWeightKg ?? 0),
      },
      sourceSummary: [
        { label: 'Source', value: lotRecord.sourceName ?? '—' },
        { label: 'Type', value: lotRecord.sourceType ?? '—' },
        { label: 'Région', value: lotRecord.regionName ?? '—' },
        { label: 'État rapide', value: lotRecord.stateQuick ?? '—' },
        { label: 'Urgence', value: lotRecord.urgency ?? '—' },
        {
          label: 'Collecté le',
          value: lotRecord.collectedAt?.toISOString?.() ?? lotRecord.collectedAt ?? '—',
        },
      ],
      chainOfCustody: [
        {
          id: lotRecord.id,
          stage: 'collection',
          label: lotRecord.sourceName ?? lotRecord.qrCode,
          detail: lotRecord.notes ?? lotRecord.currentLocationType ?? 'Collecte initiale',
          occurredAt: lotRecord.collectedAt,
          weightKg: Number(lotRecord.actualWeightKg ?? lotRecord.declaredWeightKg ?? 0),
          status: lotRecord.status,
        },
        ...receptions.map((item) => ({
          id: item.id,
          stage: 'depot',
          label: item.depotName ?? 'Dépôt',
          detail: item.zoneCode ? `Zone ${item.zoneCode}` : 'Réception dépôt',
          occurredAt: item.receivedAt,
          weightKg: Number(item.actualWeightKg ?? 0),
          status: Number(item.discrepancyKg ?? 0) === 0 ? 'clear' : 'flagged',
        })),
        ...washings.map((item) => ({
          id: item.id,
          stage: 'laverie',
          label: item.laverieName ?? 'Laverie',
          detail: item.completedAt ? 'Run terminé' : 'Run en cours',
          occurredAt: item.completedAt ?? item.startedAt,
          weightKg: Number(item.cleanWeightKg ?? item.dirtyWeightKg ?? 0),
          status: item.completedAt ? 'completed' : 'in_progress',
        })),
        ...downstreamLinks.map((item) => ({
          id: item.productId ?? item.runId,
          stage: 'transformation',
          label: item.productCode ?? item.transformerName ?? 'Transformation',
          detail: item.transformerName ?? item.track,
          occurredAt: item.createdAt,
          weightKg: Number(item.weightUsedKg ?? 0),
          status: item.productStatus ?? item.certificationStatus ?? 'linked',
        })),
      ],
      qualityChecks: qualityChecks.map((item) => ({
        id: item.id,
        grade: item.grade,
        safetyStatus: item.safetyStatus,
        fiberLengthMm: item.fiberLengthMm,
        fiberDiameterMicron: item.fiberDiameterMicron,
        contaminationNotes: item.contaminationNotes,
        pricePerKg: item.pricePerKg,
        totalValue: item.totalValue,
        performedAt: item.performedAt,
      })),
      weighs,
      downstreamLinks: downstreamLinks.map((item) => ({
        id: item.productId ?? item.runId,
        productCode: item.productCode,
        productStatus: item.productStatus,
        certificationStatus: item.certificationStatus,
        transformerName: item.transformerName,
        track: item.track,
      })),
      timeline,
    };
  }

  private async findProductTraceability(lookupKey: string) {
    const conditions = [eq(products.productCode, lookupKey)];

    if (isUuid(lookupKey)) {
      conditions.push(eq(products.id, lookupKey));
    }

    const [productRecord] = await this.db
      .select({
        id: products.id,
        productCode: products.productCode,
        productTypeCode: products.productTypeCode,
        track: products.track,
        quantity: products.quantity,
        unit: products.unit,
        weightKg: products.weightKg,
        status: products.status,
        createdAt: products.createdAt,
        runId: productionRuns.id,
        transformerName: transformers.name,
        transformerTrack: transformers.track,
        inputWeightKg: productionRuns.inputWeightKg,
        outputWeightKg: productionRuns.outputWeightKg,
        certificationId: certifications.id,
        certificationStatus: certifications.status,
        qrCodeUrl: certifications.qrCodeUrl,
      })
      .from(products)
      .leftJoin(productionRuns, eq(products.productionRunId, productionRuns.id))
      .leftJoin(transformers, eq(productionRuns.transformerId, transformers.id))
      .leftJoin(certifications, eq(certifications.productId, products.id))
      .where(or(...conditions))
      .limit(1);

    if (!productRecord) {
      return null;
    }

    const sourceLots = productRecord.runId
      ? await this.db
          .select({
            lotId: lots.id,
            qrCode: lots.qrCode,
            sourceType: lots.sourceType,
            sourceName: sources.name,
            regionName: regions.name,
            weightUsedKg: productionRunLots.weightUsedKg,
            lotStatus: lots.status,
          })
          .from(productionRunLots)
          .innerJoin(lots, eq(productionRunLots.lotId, lots.id))
          .leftJoin(sources, eq(lots.sourceId, sources.id))
          .leftJoin(regions, eq(sources.regionId, regions.id))
          .where(eq(productionRunLots.runId, productRecord.runId))
          .orderBy(asc(lots.qrCode))
      : [];

    const aggregateIds = [
      productRecord.id,
      productRecord.runId,
      productRecord.certificationId,
      ...sourceLots.map((item) => item.lotId),
    ].filter((value): value is string => Boolean(value));

    const timeline =
      aggregateIds.length > 0
        ? await this.db
            .select({
              id: events.id,
              eventType: events.eventType,
              aggregateType: events.aggregateType,
              aggregateId: events.aggregateId,
              actorType: events.actorType,
              actorName: users.fullName,
              occurredAt: events.occurredAt,
            })
            .from(events)
            .leftJoin(users, eq(events.actorId, users.id))
            .where(inArray(events.aggregateId, aggregateIds))
            .orderBy(desc(events.occurredAt))
            .limit(20)
        : [];

    return {
      entityType: 'product',
      header: {
        title: productRecord.productCode,
        subtitle: productRecord.transformerName,
        status: productRecord.status,
        track: productRecord.track,
        weightKg: Number(productRecord.weightKg ?? 0),
      },
      sourceSummary: sourceLots.map((item) => ({
        label: item.qrCode,
        value: `${item.sourceName ?? 'Source'} / ${item.regionName ?? '—'} / ${item.weightUsedKg} kg`,
      })),
      chainOfCustody: [
        ...sourceLots.map((item) => ({
          id: item.lotId,
          stage: 'source_lot',
          label: item.qrCode,
          detail: `${item.sourceName ?? 'Source'} / ${item.regionName ?? '—'}`,
          occurredAt: null,
          weightKg: Number(item.weightUsedKg ?? 0),
          status: item.lotStatus,
        })),
        {
          id: productRecord.runId,
          stage: 'production',
          label: productRecord.transformerName ?? 'Transformation',
          detail: productRecord.productTypeCode,
          occurredAt: productRecord.createdAt,
          weightKg: Number(productRecord.outputWeightKg ?? productRecord.inputWeightKg ?? 0),
          status: productRecord.status,
        },
        productRecord.certificationId
          ? {
              id: productRecord.certificationId,
              stage: 'certification',
              label: productRecord.productCode,
              detail: productRecord.qrCodeUrl ?? 'Certification NFN',
              occurredAt: productRecord.createdAt,
              weightKg: Number(productRecord.weightKg ?? 0),
              status: productRecord.certificationStatus ?? 'pending',
            }
          : null,
      ].filter(Boolean),
      qualityChecks: productRecord.certificationId
        ? [
            {
              id: productRecord.certificationId,
              grade: null,
              safetyStatus: productRecord.certificationStatus,
              fiberLengthMm: null,
              fiberDiameterMicron: null,
              contaminationNotes: null,
              pricePerKg: null,
              totalValue: null,
              performedAt: productRecord.createdAt,
            },
          ]
        : [],
      weighs: [],
      downstreamLinks: productRecord.certificationId
        ? [
            {
              id: productRecord.certificationId,
              productCode: productRecord.productCode,
              productStatus: productRecord.status,
              certificationStatus: productRecord.certificationStatus,
              transformerName: productRecord.transformerName,
              track: productRecord.transformerTrack,
            },
          ]
        : [],
      timeline,
    };
  }

  private async findCertificationTraceability(lookupKey: string) {
    const conditions = [eq(certifications.productCode, lookupKey)];

    if (isUuid(lookupKey)) {
      conditions.push(eq(certifications.id, lookupKey));
    }

    const [certificationRecord] = await this.db
      .select({
        id: certifications.id,
        productId: certifications.productId,
      })
      .from(certifications)
      .where(or(...conditions))
      .limit(1);

    if (!certificationRecord) {
      return null;
    }

    return this.findProductTraceability(certificationRecord.productId);
  }
}
